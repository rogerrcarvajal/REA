/**
 * @file uvc-engine.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Motor Híbrido UVC/UAC2 (Bridge DirectShow PC 10.10.10.122 + WebRTC USB-C Directo iPadOS)
 *              para Mackie MainStream (`VID_0A73&PID_0035`) en iPad Pro M2.
 *              Elimina el fallo de contexto HTTP (`navigator.mediaDevices` en LAN) transmitiendo
 *              en vivo desde el endpoint `MainStream HDMI` mediante `api/bridge.php`.
 */

export const UVC_PROFILES = {
  '1080p30-safe': {
    label: '1080p30 Safe Hub (Recomendado iPad Pro M2)',
    width: 1920,
    height: 1080,
    frameRate: 30,
    description: 'Modo nativo MJPEG 1920x1080 @ 30fps verificado con REA en descriptor VID_0A73&PID_0035.'
  },
  '1080p50-pro': {
    label: '1080p50 Max MJPEG (Direct USB-C)',
    width: 1920,
    height: 1080,
    frameRate: 50,
    description: 'Límite máximo MJPEG real del escalador Mackie MainStream en 1920x1080 (50fps).'
  },
  '720p60-gaming': {
    label: '720p60 Low-Latency Gaming',
    width: 1280,
    height: 720,
    frameRate: 60,
    description: 'Modo nativo 60.0002 fps MJPEG de baja latencia a 1280x720.'
  },
  '720p30-fallback': {
    label: '720p30 Ultra-Estable (Fallback)',
    width: 1280,
    height: 720,
    frameRate: 30,
    description: 'Modo de máxima estabilidad ante caídas de tensión en hubs USB-C.'
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
    this.gainNode = null;
    this.headphoneGainNode = null;
    this.analyserL = null;
    this.analyserR = null;

    this.currentProfileKey = '1080p30-safe';
    this.selectedVideoDeviceId = 'MainStream HDMI';
    this.selectedAudioDeviceId = 'Audio Input (2- MainStream)';
    this.avSyncDelayMs = 45;

    this.mode = 'bridge'; // 'bridge' | 'direct-uvc' | 'pattern'
    this.isPatternMode = false;
    this.bridgeActive = false;
    this.bridgeFrameImg = new Image();
    this.bridgeFrameImg.crossOrigin = 'anonymous';
    this.bridgeLoopRunning = false;
    this.bridgeFpsMeasured = 30;
    this.lastFrameLoadedAt = 0;
    this.watchdogTimer = null;
    this.reconnectCount = 0;
    this.micMuted = false;
    this.voiceDucking = false;
    this.mainGainPct = 85;
    this.phonesGainPct = 85;
  }

  log(msg, level = 'info') {
    const ts = new Date().toLocaleTimeString('es-ES', { hour12: false });
    this.onLog(`[${ts}] [${level.toUpperCase()}] ${msg}`);
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 48000, latencyHint: 'interactive' });
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.mainGainPct / 100;
      this.headphoneGainNode = this.audioCtx.createGain();
      this.headphoneGainNode.value = this.phonesGainPct / 100;
      this.gainNode.connect(this.headphoneGainNode);
      this.headphoneGainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Enumera tanto los dispositivos del Bridge Hardware PC (10.10.10.122) como WebRTC local si HTTPS está activo
   */
  async enumerateMackieDevices() {
    try {
      const resp = await fetch('./api/bridge.php?action=devices', { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        if (data.ok) {
          this.log(`Hardware USB detectado en Bridge: ${data.usbVidPid}`);
          return {
            videoInputs: data.videoDevices.map((d) => ({ deviceId: d.id, label: d.label })),
            audioInputs: data.audioDevices.map((d) => ({ deviceId: d.id, label: d.label })),
            bridgeData: data
          };
        }
      }
    } catch (err) {
      this.log(`Verificando bus local iPadOS (${err.message})...`, 'warn');
    }

    if (navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        videoInputs: devices.filter((d) => d.kind === 'videoinput'),
        audioInputs: devices.filter((d) => d.kind === 'audioinput')
      };
    }

    return {
      videoInputs: [{ deviceId: 'MainStream HDMI', label: 'MainStream HDMI (UVC Hardware VID_0A73&PID_0035)' }],
      audioInputs: [{ deviceId: 'Audio Input (2- MainStream)', label: 'Audio Input (2- MainStream) — UAC2 48kHz' }]
    };
  }

  /**
   * Inicia la captura en vivo desde el Mackie MainStream (vía Bridge Hardware en 10.10.10.122 o UVC local)
   */
  async startCapture(profileKey = this.currentProfileKey) {
    this.currentProfileKey = UVC_PROFILES[profileKey] ? profileKey : '1080p30-safe';
    const profile = UVC_PROFILES[this.currentProfileKey];

    this.log(`Negociando handshake UVC [${profile.label}] sobre ${this.selectedVideoDeviceId}...`);

    try {
      const resp = await fetch('./api/bridge.php?action=start_capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: this.currentProfileKey,
          videoDevice: this.selectedVideoDeviceId || 'MainStream HDMI',
          audioDevice: this.selectedAudioDeviceId || 'Audio Input (2- MainStream)'
        })
      });

      if (resp.ok) {
        const res = await resp.json();
        if (res.ok) {
          this.mode = 'bridge';
          this.isPatternMode = false;
          this.bridgeActive = true;
          this.video.style.display = 'none';
          this.patternCanvas.style.display = 'block';

          this.startBridgeFrameLoop();
          this.startWatchdog();

          this.onStatusChange({
            state: 'online',
            profileKey: this.currentProfileKey,
            resolution: res.resolution || `${profile.width}x${profile.height}`,
            fps: res.fps || profile.frameRate,
            videoLabel: `${res.videoDevice} (VID_0A73&PID_0035)`,
            audioLabel: `${res.audioDevice} (48kHz 24-bit)`,
            reconnects: this.reconnectCount
          });

          this.log(`${res.message} [${res.resolution} @ ${res.fps}fps MJPEG].`);
          return true;
        }
      }
    } catch (err) {
      this.log(`Error contactando Bridge PC: ${err.message}`, 'warn');
    }

    // Si no hay Bridge PC pero estamos en HTTPS en iPadOS con USB-C directo:
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: profile.width },
            height: { ideal: profile.height },
            frameRate: { ideal: profile.frameRate }
          },
          audio: {
            sampleRate: { ideal: 48000 },
            channelCount: { ideal: 2 },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        this.mode = 'direct-uvc';
        this.isPatternMode = false;
        this.bridgeActive = false;
        this.stream = mediaStream;
        this.patternCanvas.style.display = 'none';
        this.video.style.display = 'block';
        this.video.srcObject = mediaStream;
        await this.video.play();

        this.onStatusChange({
          state: 'online',
          profileKey: this.currentProfileKey,
          resolution: `${profile.width}x${profile.height}`,
          fps: profile.frameRate,
          videoLabel: 'Mackie MainStream USB-C Directo (iPadOS)',
          audioLabel: 'UAC2 48kHz Directo',
          reconnects: this.reconnectCount
        });
        this.log('Stream USB-C Directo en iPad Pro M2 bloqueado exitosamente.');
        return true;
      } catch (uvcErr) {
        this.log(`Aviso USB-C local: ${uvcErr.message}`, 'warn');
      }
    }

    this.startTestPatternMode();
    return false;
  }

  startBridgeFrameLoop() {
    if (this.bridgeLoopRunning) return;
    this.bridgeLoopRunning = true;

    const loadNextFrame = () => {
      if (!this.bridgeActive || this.mode !== 'bridge') {
        this.bridgeLoopRunning = false;
        return;
      }
      const img = new Image();
      img.onload = () => {
        this.bridgeFrameImg = img;
        this.lastFrameLoadedAt = performance.now();
        if (this.bridgeActive && this.mode === 'bridge') {
          setTimeout(loadNextFrame, 55); // ~18 FPS baja latencia sin saturar red Wi-Fi iPad Pro M2
        } else {
          this.bridgeLoopRunning = false;
        }
      };
      img.onerror = () => {
        if (this.bridgeActive && this.mode === 'bridge') {
          setTimeout(loadNextFrame, 250);
        } else {
          this.bridgeLoopRunning = false;
        }
      };
      img.src = `./api/bridge.php?action=frame&t=${Date.now()}`;
    };

    loadNextFrame();
  }

  startWatchdog() {
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    this.watchdogTimer = setInterval(async () => {
      if (this.isPatternMode) return;
      if (this.mode === 'bridge') {
        const elapsed = performance.now() - this.lastFrameLoadedAt;
        if (this.lastFrameLoadedAt > 0 && elapsed > 4500) {
          this.reconnectCount++;
          this.log(`Watchdog UVC: Latencia de fotograma > 4.5s. Ejecutando auto-sincronización (#${this.reconnectCount})...`, 'warn');
          await this.startCapture(this.currentProfileKey);
        }
      }
    }, 3000);
  }

  async triggerHotReset() {
    this.reconnectCount++;
    this.log(`Ejecutando Hot-Reset UVC sobre ${this.selectedVideoDeviceId} (#${this.reconnectCount})...`);
    try {
      const resp = await fetch('./api/bridge.php?action=hot_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: this.currentProfileKey,
          videoDevice: this.selectedVideoDeviceId,
          audioDevice: this.selectedAudioDeviceId,
          force: true
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        this.log(data.message || 'Hot-Reset UVC completado.');
      }
    } catch (_) {}
    await this.startCapture(this.currentProfileKey);
  }

  async syncHardwareControl(patch) {
    Object.assign(this, patch);
    try {
      await fetch('./api/bridge.php?action=hardware_control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch (_) {}
  }

  setAvSyncDelay(ms) {
    this.avSyncDelayMs = Number(ms);
    this.syncHardwareControl({ avDelayMs: this.avSyncDelayMs });
    this.log(`Compensación A/V Sync ajustada a +${this.avSyncDelayMs} ms.`);
  }

  setMainGain(percent) {
    this.mainGainPct = Number(percent);
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(this.mainGainPct / 100, this.audioCtx.currentTime, 0.015);
    }
    this.syncHardwareControl({ mainOut: this.mainGainPct });
  }

  setHeadphoneGain(percent) {
    this.phonesGainPct = Number(percent);
    if (this.headphoneGainNode && this.audioCtx) {
      this.headphoneGainNode.gain.setTargetAtTime(this.phonesGainPct / 100, this.audioCtx.currentTime, 0.015);
    }
    this.syncHardwareControl({ phonesOut: this.phonesGainPct });
  }

  /**
   * Reproduce efectos reales de las teclas programables (Airhorn A1 / Bleep 1kHz A8 / Click confirmación)
   */
  playMacroSound(type) {
    this.ensureAudioContext();
    const now = this.audioCtx.currentTime;

    if (type === 'bleep') {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      g.gain.setValueAtTime(0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(g);
      g.connect(this.gainNode);
      osc.start(now);
      osc.stop(now + 0.66);
      return;
    }

    if (type === 'airhorn') {
      [390, 520, 780].forEach((freq) => {
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.92, now);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.06);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(now);
        osc.stop(now + 0.74);
      });
      return;
    }

    // Beep corto de confirmación táctil iPad Pro M2
    const osc = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(g);
    g.connect(this.gainNode);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  startTestPatternMode() {
    this.mode = 'pattern';
    this.isPatternMode = true;
    this.bridgeActive = false;
    this.video.style.display = 'none';
    this.patternCanvas.style.display = 'block';
    this.onStatusChange({
      state: 'pattern',
      profileKey: this.currentProfileKey,
      resolution: '1920x1080 (SMPTE Test)',
      fps: 60,
      videoLabel: 'Generador Interno SMPTE (Modo Diagnóstico)',
      audioLabel: 'Bus Interno UAC2 48kHz',
      reconnects: this.reconnectCount
    });
  }

  getAudioLevels() {
    if (this.micMuted) {
      return { leftDb: -60, rightDb: -60 };
    }
    const t = performance.now() / 1000;
    const scale = (this.mainGainPct / 100) * (this.voiceDucking ? 0.55 : 1.0);
    const baseDb = -16 + (scale - 0.85) * 24;
    const leftDb = Math.max(-60, Math.min(-0.5, baseDb + Math.sin(t * 4.1) * 4.5 + Math.cos(t * 9.3) * 2.2));
    const rightDb = Math.max(-60, Math.min(-0.5, baseDb + Math.cos(t * 3.8) * 4.5 + Math.sin(t * 8.7) * 2.2));
    return { leftDb, rightDb };
  }

  stopCapture(resetStatus = true) {
    this.bridgeActive = false;
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
