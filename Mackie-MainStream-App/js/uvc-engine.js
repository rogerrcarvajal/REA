/**
 * @file uvc-engine.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Motor de estabilización UVC/UAC2 y corrección de fallos de entrada de video HDMI
 *              para Mackie MainStream conectado por USB-C a iPad Pro M2 (iPadOS 17+ / Apple Silicon ARM64).
 */

export const UVC_PROFILES = {
  '1080p30-safe': {
    label: '1080p30 Safe Hub (Recomendado iPad Pro M2)',
    width: 1920,
    height: 1080,
    frameRate: 30,
    description: 'Evita saturación de ancho de banda isócrono USB-C 2.0/3.0 en iPadOS 17+ manteniendo Full HD nítido.'
  },
  '1080p60-pro': {
    label: '1080p60 Pro Stream (Direct USB-C)',
    width: 1920,
    height: 1080,
    frameRate: 60,
    description: 'Máxima fluidez 60fps para conexión directa USB-C o hub Thunderbolt 4 con PD.'
  },
  '720p60-gaming': {
    label: '720p60 Low-Latency Gaming',
    width: 1280,
    height: 720,
    frameRate: 60,
    description: 'Baja latencia de decodificación MJPEG a 60fps con consumo reducido de bus USB.'
  },
  '720p30-fallback': {
    label: '720p30 Ultra-Estable (Fallback)',
    width: 1280,
    height: 720,
    frameRate: 30,
    description: 'Modo de emergencia a prueba de cortes eléctricos en hubs USB-C multipuerto.'
  }
};

export class MackieMainStreamUVCEngine {
  constructor({ videoElement, patternCanvas, onLog, onStatusChange }) {
    this.video = videoElement;
    this.patternCanvas = patternCanvas;
    this.onLog = onLog || (() => {});
    this.onStatusChange = onStatusChange || (() => {});

    this.stream = null;
    this.audioCtx = null;
    this.sourceNode = null;
    this.delayNode = null;
    this.gainNode = null;
    this.headphoneGainNode = null;
    this.analyserL = null;
    this.analyserR = null;
    this.splitter = null;

    this.currentProfileKey = '1080p30-safe';
    this.selectedVideoDeviceId = '';
    this.selectedAudioDeviceId = '';
    this.avSyncDelayMs = 45; // Compensación base HDMI -> UAC2 en MainStream
    this.isPatternMode = false;
    this.watchdogTimer = null;
    this.lastLumaSignature = '';
    this.frozenCounter = 0;
    this.reconnectCount = 0;

    this.offscreenSample = document.createElement('canvas');
    this.offscreenSample.width = 16;
    this.offscreenSample.height = 16;
    this.offscreenCtx = this.offscreenSample.getContext('2d', { willReadFrequently: true });
  }

  log(msg, level = 'info') {
    const ts = new Date().toLocaleTimeString('es-ES', { hour12: false });
    this.onLog(`[${ts}] [${level.toUpperCase()}] ${msg}`);
  }

  async enumerateMackieDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.log('API mediaDevices no disponible en este contexto.', 'warn');
      return { videoInputs: [], audioInputs: [] };
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    const audioInputs = devices.filter((d) => d.kind === 'audioinput');

    // Priorizar automáticamente dispositivos con firma "MainStream" o "Mackie"
    const mackieVideo = videoInputs.find((d) => /mainstream|mackie|uvc|hdmi|capture/i.test(d.label));
    const mackieAudio = audioInputs.find((d) => /mainstream|mackie|usb/i.test(d.label));

    if (mackieVideo && !this.selectedVideoDeviceId) {
      this.selectedVideoDeviceId = mackieVideo.deviceId;
      this.log(`Hardware UVC detectado: ${mackieVideo.label}`);
    }
    if (mackieAudio && !this.selectedAudioDeviceId) {
      this.selectedAudioDeviceId = mackieAudio.deviceId;
      this.log(`Interfaz UAC2 detectada: ${mackieAudio.label}`);
    }

    return { videoInputs, audioInputs };
  }

  /**
   * Negociación UVC con Cascada Automática de Fallback para corregir el fallo de video en iPad Pro M2
   */
  async startCapture(profileKey = this.currentProfileKey) {
    this.stopCapture(false);
    this.isPatternMode = false;
    this.currentProfileKey = profileKey;

    const cascadeOrder = [
      profileKey,
      '1080p30-safe',
      '720p60-gaming',
      '720p30-fallback'
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const candidateKey of cascadeOrder) {
      const profile = UVC_PROFILES[candidateKey];
      try {
        this.log(`Negociando handshake UVC [${profile.label}] (${profile.width}x${profile.height}@${profile.frameRate}fps)...`);

        const videoConstraints = {
          width: { ideal: profile.width, max: profile.width },
          height: { ideal: profile.height, max: profile.height },
          frameRate: { ideal: profile.frameRate, max: profile.frameRate },
          resizeMode: 'none'
        };
        if (this.selectedVideoDeviceId) {
          videoConstraints.deviceId = { exact: this.selectedVideoDeviceId };
        }

        const audioConstraints = {
          sampleRate: { ideal: 48000 },
          sampleSize: { ideal: 24 },
          channelCount: { ideal: 2 },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        };
        if (this.selectedAudioDeviceId) {
          audioConstraints.deviceId = { exact: this.selectedAudioDeviceId };
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });

        await this.attachStream(mediaStream, candidateKey);
        return true;
      } catch (err) {
        this.log(`Fallo en perfil ${candidateKey}: ${err.name} (${err.message}). Probando siguiente nivel de cascada...`, 'warn');
      }
    }

    // Último intento sin restricciones estrictas de dispositivo
    try {
      this.log('Ejecutando negociación UVC genérica de emergencia para iPadOS...', 'warn');
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await this.attachStream(fallbackStream, 'generic-uvc');
      return true;
    } catch (finalErr) {
      this.log(`No se detectó señal UVC física (${finalErr.message}). Activando Generador de Señal Broadcast SMPTE para diagnóstico.`, 'error');
      this.startTestPatternMode();
      return false;
    }
  }

  async attachStream(mediaStream, activeProfileKey) {
    this.stream = mediaStream;
    this.patternCanvas.style.display = 'none';
    this.video.style.display = 'block';
    this.video.srcObject = mediaStream;
    this.video.muted = true; // El audio se procesa por el grafo WebAudio con compensación de delay
    await this.video.play();

    const vTrack = mediaStream.getVideoTracks()[0];
    const aTrack = mediaStream.getAudioTracks()[0];
    const settings = vTrack ? vTrack.getSettings() : {};

    // Configurar motor WebAudio UAC2 a 48kHz con nodo Delay A/V Sync
    this.setupAudioGraph(mediaStream);

    // Suscribir eventos de corte de endpoint USB-C en iPad Pro M2
    if (vTrack) {
      vTrack.onmute = () => {
        this.log('Alerta UVC: Endpoint de video silenciado por bus USB-C (mute). Preparando re-adquisición...', 'warn');
        this.scheduleAutoRecovery('track.onmute');
      };
      vTrack.onended = () => {
        this.log('Alerta UVC: Track HDMI finalizado inesperadamente (ended). Re-sincronizando...', 'error');
        this.scheduleAutoRecovery('track.onended');
      };
    }

    this.startWatchdog();

    this.onStatusChange({
      state: 'online',
      profileKey: activeProfileKey,
      resolution: `${settings.width || 1920}x${settings.height || 1080}`,
      fps: Math.round(settings.frameRate || 30),
      videoLabel: vTrack?.label || 'Mackie MainStream UVC',
      audioLabel: aTrack?.label || 'Mackie MainStream UAC2 48kHz',
      reconnects: this.reconnectCount
    });

    this.log(`Stream UVC bloqueado exitosamente: ${settings.width || 1920}x${settings.height || 1080} @ ${Math.round(settings.frameRate || 30)}fps | Audio 48kHz.`);
  }

  setupAudioGraph(mediaStream) {
    if (!mediaStream.getAudioTracks().length) return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 48000, latencyHint: 'interactive' });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (_) {}
    }

    this.sourceNode = this.audioCtx.createMediaStreamSource(mediaStream);
    this.delayNode = this.audioCtx.createDelay(1.0);
    this.delayNode.delayTime.value = this.avSyncDelayMs / 1000;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1.0;

    this.headphoneGainNode = this.audioCtx.createGain();
    this.headphoneGainNode.gain.value = 0.85;

    this.splitter = this.audioCtx.createChannelSplitter(2);
    this.analyserL = this.audioCtx.createAnalyser();
    this.analyserR = this.audioCtx.createAnalyser();
    this.analyserL.fftSize = 512;
    this.analyserR.fftSize = 512;

    this.sourceNode.connect(this.delayNode);
    this.delayNode.connect(this.gainNode);
    this.gainNode.connect(this.splitter);
    this.splitter.connect(this.analyserL, 0);
    this.splitter.connect(this.analyserR, 1);

    this.gainNode.connect(this.headphoneGainNode);
    this.headphoneGainNode.connect(this.audioCtx.destination);
  }

  setAvSyncDelay(ms) {
    this.avSyncDelayMs = Number(ms);
    if (this.delayNode && this.audioCtx) {
      this.delayNode.delayTime.setTargetAtTime(this.avSyncDelayMs / 1000, this.audioCtx.currentTime, 0.015);
    }
    this.log(`Compensación A/V Sync ajustada a ${this.avSyncDelayMs} ms.`);
  }

  setMainGain(percent) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(percent / 100, this.audioCtx.currentTime, 0.015);
    }
  }

  setHeadphoneGain(percent) {
    if (this.headphoneGainNode && this.audioCtx) {
      this.headphoneGainNode.gain.setTargetAtTime(percent / 100, this.audioCtx.currentTime, 0.015);
    }
  }

  /**
   * Watchdog detector de cuadros congelados (Frozen Frame / Black UVC Buffer en iPadOS)
   */
  startWatchdog() {
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    this.frozenCounter = 0;
    this.watchdogTimer = setInterval(() => {
      if (this.isPatternMode || !this.stream || this.video.readyState < 2) return;
      try {
        this.offscreenCtx.drawImage(this.video, 0, 0, 16, 16);
        const data = this.offscreenCtx.getImageData(0, 0, 16, 16).data;
        let sum = 0;
        let sig = '';
        for (let i = 0; i < data.length; i += 16) {
          const luma = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          sum += luma;
          sig += luma.toString(16);
        }
        if (sig === this.lastLumaSignature && sum === 0) {
          this.frozenCounter++;
          if (this.frozenCounter >= 4) {
            this.log('Watchdog UVC: Detectados 4 ciclos de buffer negro estático. Listo para Hot-Reset si hay corte HDMI.', 'warn');
            this.frozenCounter = 0;
          }
        } else {
          this.frozenCounter = 0;
        }
        this.lastLumaSignature = sig;
      } catch (_) {}
    }, 1800);
  }

  scheduleAutoRecovery(reason) {
    this.reconnectCount++;
    this.log(`Iniciando Auto-Recovery UVC (#${this.reconnectCount}) por causa: ${reason}...`, 'warn');
    setTimeout(() => {
      this.startCapture(this.currentProfileKey);
    }, 650);
  }

  startTestPatternMode() {
    this.isPatternMode = true;
    this.video.style.display = 'none';
    this.patternCanvas.style.display = 'block';
    this.onStatusChange({
      state: 'pattern',
      profileKey: this.currentProfileKey,
      resolution: '1920x1080 (SMPTE Test)',
      fps: 60,
      videoLabel: 'Generador Interno SMPTE (Sin HDMI activo)',
      audioLabel: 'Oscilador de Prueba / Bus Interno 48kHz',
      reconnects: this.reconnectCount
    });
  }

  getAudioLevels() {
    if (!this.analyserL || !this.analyserR) {
      const t = performance.now() / 1000;
      return {
        leftDb: this.isPatternMode ? -14 + Math.sin(t * 3.2) * 4 : -60,
        rightDb: this.isPatternMode ? -14 + Math.cos(t * 2.9) * 4 : -60
      };
    }
    const bufL = new Float32Array(this.analyserL.fftSize);
    const bufR = new Float32Array(this.analyserR.fftSize);
    this.analyserL.getFloatTimeDomainData(bufL);
    this.analyserR.getFloatTimeDomainData(bufR);

    const calcDb = (buf) => {
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      return Math.max(-60, Math.min(0, 20 * Math.log10(rms + 1e-6)));
    };
    return { leftDb: calcDb(bufL), rightDb: calcDb(bufR) };
  }

  stopCapture(resetStatus = true) {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (resetStatus) {
      this.onStatusChange({
        state: 'offline',
        profileKey: this.currentProfileKey,
        resolution: 'Sin Señal',
        fps: 0,
        videoLabel: 'Desconectado',
        audioLabel: 'Desconectado',
        reconnects: this.reconnectCount
      });
    }
  }
}
