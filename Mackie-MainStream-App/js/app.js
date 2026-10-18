/**
 * @file app.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Controlador principal de UI, Scopes ProMotion 120Hz (Luma Waveform, Histograma RGB, VU/LUFS)
 *              y Grabador Local MP4/WebM para Mackie MainStream Studio M2 en iPad Pro M2.
 */

import { MackieMainStreamUVCEngine, UVC_PROFILES } from './uvc-engine.js';

document.addEventListener('DOMContentLoaded', async () => {
  const videoEl = document.getElementById('uvcVideo');
  const patternCanvas = document.getElementById('patternCanvas');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const histogramCanvas = document.getElementById('histogramCanvas');
  const vuCanvas = document.getElementById('vuCanvas');
  const diagLogEl = document.getElementById('diagLog');

  const profileSelect = document.getElementById('uvcProfileSelect');
  const videoDeviceSelect = document.getElementById('videoDeviceSelect');
  const audioDeviceSelect = document.getElementById('audioDeviceSelect');
  const avDelayRange = document.getElementById('avDelayRange');
  const avDelayVal = document.getElementById('avDelayVal');

  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const resBadge = document.getElementById('resBadge');
  const fpsBadge = document.getElementById('fpsBadge');
  const hudDeviceLabel = document.getElementById('hudDeviceLabel');
  const hudSyncLabel = document.getElementById('hudSyncLabel');

  const btnConnect = document.getElementById('btnConnect');
  const btnHotReset = document.getElementById('btnHotReset');
  const btnPattern = document.getElementById('btnPattern');
  const btnPip = document.getElementById('btnPip');
  const btnSnapshot = document.getElementById('btnSnapshot');
  const btnRecord = document.getElementById('btnRecord');

  let mediaRecorder = null;
  let recordedChunks = [];

  // Inicializar selector de perfiles UVC
  Object.entries(UVC_PROFILES).forEach(([key, cfg]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = cfg.label;
    profileSelect.appendChild(opt);
  });

  const appendLog = (line) => {
    const div = document.createElement('div');
    div.textContent = line;
    diagLogEl.prepend(div);
    while (diagLogEl.children.length > 40) {
      diagLogEl.removeChild(diagLogEl.lastChild);
    }
  };

  const updateStatusUI = (info) => {
    statusDot.className = 'dot ' + (info.state === 'online' ? 'online' : info.state === 'pattern' ? 'warning' : 'danger');
    statusText.textContent =
      info.state === 'online'
        ? 'UVC LOCK ACTIVO'
        : info.state === 'pattern'
        ? 'MODO PATRÓN SMPTE'
        : 'SIN SEÑAL UVC';
    resBadge.textContent = info.resolution;
    fpsBadge.textContent = `${info.fps} FPS`;
    hudDeviceLabel.textContent = `${info.videoLabel} | ${info.audioLabel}`;
  };

  const engine = new MackieMainStreamUVCEngine({
    videoElement: videoEl,
    patternCanvas,
    onLog: appendLog,
    onStatusChange: updateStatusUI
  });

  async function refreshDevices() {
    const { videoInputs, audioInputs } = await engine.enumerateMackieDevices();

    videoDeviceSelect.innerHTML = '<option value="">Auto-Detectar Mackie MainStream HDMI UVC</option>';
    videoInputs.forEach((d, idx) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Capturadora UVC HDMI #${idx + 1}`;
      if (d.deviceId === engine.selectedVideoDeviceId) opt.selected = true;
      videoDeviceSelect.appendChild(opt);
    });

    audioDeviceSelect.innerHTML = '<option value="">Auto-Detectar Mackie MainStream UAC2 (48kHz)</option>';
    audioInputs.forEach((d, idx) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Interfaz Audio USB #${idx + 1}`;
      if (d.deviceId === engine.selectedAudioDeviceId) opt.selected = true;
      audioDeviceSelect.appendChild(opt);
    });
  }

  await refreshDevices();
  if (navigator.mediaDevices) {
    navigator.mediaDevices.ondevicechange = () => {
      appendLog('[USB-C BUS] Cambio detectado en topología USB-C del iPad Pro M2. Actualizando endpoints...');
      refreshDevices();
    };
  }

  // Eventos de conexión y estabilización UVC
  btnConnect.addEventListener('click', async () => {
    engine.selectedVideoDeviceId = videoDeviceSelect.value;
    engine.selectedAudioDeviceId = audioDeviceSelect.value;
    await engine.startCapture(profileSelect.value);
    await refreshDevices();
  });

  btnHotReset.addEventListener('click', async () => {
    appendLog('[HOT-RESET] Reiniciando endpoint UVC/UAC2 y limpiando buffers de video...');
    engine.scheduleAutoRecovery('Manual Hot-Reset iPad Pro M2');
  });

  btnPattern.addEventListener('click', () => {
    engine.stopCapture(false);
    engine.startTestPatternMode();
  });

  profileSelect.addEventListener('change', () => {
    engine.startCapture(profileSelect.value);
  });

  videoDeviceSelect.addEventListener('change', () => {
    engine.selectedVideoDeviceId = videoDeviceSelect.value;
    engine.startCapture(profileSelect.value);
  });

  audioDeviceSelect.addEventListener('change', () => {
    engine.selectedAudioDeviceId = audioDeviceSelect.value;
    engine.startCapture(profileSelect.value);
  });

  avDelayRange.addEventListener('input', (e) => {
    const val = e.target.value;
    avDelayVal.textContent = `${val} ms`;
    hudSyncLabel.textContent = `A/V SYNC: +${val}ms | 48kHz 24-bit`;
    engine.setAvSyncDelay(val);
  });

  // Controles físicos simulados del panel superior de Mackie MainStream
  const bindKnob = (inputId, valId, suffix, callback) => {
    const input = document.getElementById(inputId);
    const label = document.getElementById(valId);
    if (!input || !label) return;
    input.addEventListener('input', (e) => {
      label.textContent = `${e.target.value}${suffix}`;
      if (callback) callback(Number(e.target.value));
    });
  };

  bindKnob('knobMain', 'knobMainVal', '%', (v) => engine.setMainGain(v));
  bindKnob('knobPhones', 'knobPhonesVal', '%', (v) => engine.setHeadphoneGain(v));
  bindKnob('knobMic', 'knobMicVal', ' dB', (v) => appendLog(`[HARDWARE] Ganancia Preamp Mic XLR/TRS ajustada a ${v > 0 ? '+' : ''}${v} dB`));
  bindKnob('knobChat', 'knobChatVal', '%', (v) => appendLog(`[HARDWARE] Balance Game/Chat Mix ajustado al ${v}%`));

  // Pads programables 1-6 del Mackie MainStream
  document.querySelectorAll('.macro-pad').forEach((pad) => {
    pad.addEventListener('click', () => {
      pad.classList.toggle('active');
      const keyName = pad.dataset.key;
      const actionName = pad.dataset.action;
      appendLog(`[CONTROL KEY ${keyName}] Ejecutada macro física MainStream: ${actionName}`);
    });
  });

  // Picture-in-Picture (PiP) para multitarea Stage Manager en iPad Pro M2
  btnPip.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoEl.readyState >= 2) {
        await videoEl.requestPictureInPicture();
      } else {
        appendLog('[PiP] Activa primero una señal de video UVC real para entrar en Picture-in-Picture.');
      }
    } catch (err) {
      appendLog(`[PiP] Error en iPadOS PiP: ${err.message}`);
    }
  });

  // Captura de fotograma PNG instantáneo
  btnSnapshot.addEventListener('click', () => {
    const snap = document.createElement('canvas');
    snap.width = 1920;
    snap.height = 1080;
    const ctx = snap.getContext('2d');
    if (engine.isPatternMode) {
      ctx.drawImage(patternCanvas, 0, 0, snap.width, snap.height);
    } else {
      ctx.drawImage(videoEl, 0, 0, snap.width, snap.height);
    }
    const a = document.createElement('a');
    a.href = snap.toDataURL('image/png');
    a.download = `Mackie-MainStream-iPadM2-${Date.now()}.png`;
    a.click();
    appendLog('[SNAPSHOT] Fotograma 1080p exportado exitosamente.');
  });

  // Grabación Local de Video/Audio en iPad Pro M2
  btnRecord.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      btnRecord.classList.remove('recording');
      btnRecord.textContent = '● REC Stream';
      return;
    }
    const targetStream = engine.stream || patternCanvas.captureStream(30);
    recordedChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    mediaRecorder = new MediaRecorder(targetStream, { mimeType });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Mackie-MainStream-Capture-${Date.now()}.${ext}`;
      a.click();
      appendLog(`[RECORDER] Grabación finalizada y descargada (${(blob.size / 1024 / 1024).toFixed(2)} MB).`);
    };
    mediaRecorder.start(1000);
    btnRecord.classList.add('recording');
    btnRecord.textContent = '■ Detener REC';
    appendLog(`[RECORDER] Grabando captura directa (${mimeType}) en almacenamiento local de iPadOS...`);
  });

  // Renderizado ProMotion 120Hz de Patrón SMPTE y Scopes Broadcast
  const pCtx = patternCanvas.getContext('2d');
  const wCtx = waveformCanvas.getContext('2d');
  const hCtx = histogramCanvas.getContext('2d');
  const vCtx = vuCanvas.getContext('2d');

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 96;
  sampleCanvas.height = 54;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  function drawSmptePattern(t) {
    const w = patternCanvas.width;
    const h = patternCanvas.height;
    const bars = ['#E2E8F0', '#FACC15', '#22D3EE', '#4ADE80', '#E879F9', '#F43F5E', '#3B82F6'];
    const bw = w / bars.length;
    bars.forEach((c, i) => {
      pCtx.fillStyle = c;
      pCtx.fillRect(i * bw, 0, bw + 1, h * 0.72);
    });

    pCtx.fillStyle = '#0F172A';
    pCtx.fillRect(0, h * 0.72, w, h * 0.28);

    // Barra de movimiento de sincronía 60/120Hz
    const xPos = ((Math.sin(t * 2.2) + 1) * 0.5) * (w - 180) + 20;
    pCtx.fillStyle = '#84CC16';
    pCtx.fillRect(xPos, h * 0.77, 140, 18);

    pCtx.fillStyle = '#F8FAFC';
    pCtx.font = 'bold 24px -apple-system, Inter, sans-serif';
    pCtx.fillText('MACKIE MAINSTREAM UVC ENGINE — iPAD PRO M2 DIAGNOSTIC SIGNAL', 36, h * 0.89);
    pCtx.fillStyle = '#00F2FE';
    pCtx.font = '18px monospace';
    pCtx.fillText(`1920x1080P | UAC2 48.0kHz 24-BIT | A/V DELAY +${engine.avSyncDelayMs}ms | TIME: ${t.toFixed(2)}s`, 36, h * 0.95);
  }

  function renderScopes(now) {
    const t = now / 1000;
    if (engine.isPatternMode) {
      drawSmptePattern(t);
      sCtx.drawImage(patternCanvas, 0, 0, 96, 54);
    } else if (videoEl.readyState >= 2) {
      sCtx.drawImage(videoEl, 0, 0, 96, 54);
    }

    const frame = sCtx.getImageData(0, 0, 96, 54).data;

    // 1. Luma Waveform Monitor (IRE 0-100)
    const ww = waveformCanvas.width;
    const wh = waveformCanvas.height;
    wCtx.fillStyle = 'rgba(5, 8, 17, 0.45)';
    wCtx.fillRect(0, 0, ww, wh);
    wCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    wCtx.beginPath();
    wCtx.moveTo(0, wh * 0.2); wCtx.lineTo(ww, wh * 0.2);
    wCtx.moveTo(0, wh * 0.5); wCtx.lineTo(ww, wh * 0.5);
    wCtx.moveTo(0, wh * 0.8); wCtx.lineTo(ww, wh * 0.8);
    wCtx.stroke();

    wCtx.fillStyle = 'rgba(0, 242, 254, 0.55)';
    for (let x = 0; x < 96; x++) {
      for (let y = 0; y < 54; y += 2) {
        const idx = (y * 96 + x) * 4;
        const luma = (0.299 * frame[idx] + 0.587 * frame[idx + 1] + 0.114 * frame[idx + 2]) / 255;
        const px = (x / 96) * ww;
        const py = wh - luma * (wh - 10) - 5;
        wCtx.fillRect(px, py, 2, 2);
      }
    }

    // 2. Histograma RGB en Tiempo Real
    const hw = histogramCanvas.width;
    const hh = histogramCanvas.height;
    hCtx.fillStyle = '#050811';
    hCtx.fillRect(0, 0, hw, hh);
    const binsR = new Uint16Array(32);
    const binsG = new Uint16Array(32);
    const binsB = new Uint16Array(32);
    for (let i = 0; i < frame.length; i += 16) {
      binsR[frame[i] >> 3]++;
      binsG[frame[i + 1] >> 3]++;
      binsB[frame[i + 2] >> 3]++;
    }
    const drawHistChannel = (bins, color) => {
      hCtx.strokeStyle = color;
      hCtx.lineWidth = 1.6;
      hCtx.beginPath();
      for (let b = 0; b < 32; b++) {
        const bx = (b / 31) * hw;
        const by = hh - Math.min(hh - 6, (bins[b] / 120) * (hh - 8));
        if (b === 0) hCtx.moveTo(bx, by);
        else hCtx.lineTo(bx, by);
      }
      hCtx.stroke();
    };
    drawHistChannel(binsR, '#F43F5E');
    drawHistChannel(binsG, '#84CC16');
    drawHistChannel(binsB, '#00F2FE');

    // 3. Medidores Estéreo VU / LUFS de 48kHz
    const vw = vuCanvas.width;
    const vh = vuCanvas.height;
    vCtx.fillStyle = '#050811';
    vCtx.fillRect(0, 0, vw, vh);
    const { leftDb, rightDb } = engine.getAudioLevels();
    const normL = (leftDb + 60) / 60;
    const normR = (rightDb + 60) / 60;

    const grad = vCtx.createLinearGradient(0, 0, vw, 0);
    grad.addColorStop(0, '#10B981');
    grad.addColorStop(0.72, '#84CC16');
    grad.addColorStop(0.88, '#F59E0B');
    grad.addColorStop(1, '#F43F5E');

    vCtx.fillStyle = grad;
    vCtx.fillRect(28, 22, Math.max(4, normL * (vw - 85)), 22);
    vCtx.fillRect(28, 58, Math.max(4, normR * (vw - 85)), 22);

    vCtx.fillStyle = '#94A3B8';
    vCtx.font = 'bold 11px monospace';
    vCtx.fillText('L', 10, 37);
    vCtx.fillText('R', 10, 73);
    vCtx.fillStyle = '#F8FAFC';
    vCtx.fillText(`${leftDb.toFixed(1)} dB`, vw - 52, 37);
    vCtx.fillText(`${rightDb.toFixed(1)} dB`, vw - 52, 73);

    requestAnimationFrame(renderScopes);
  }

  // Iniciar en modo patrón por defecto hasta pulsar Conectar o auto-iniciar
  engine.startTestPatternMode();
  appendLog('Mackie MainStream Studio M2 inicializado. Listo para negociar UVC 1080p en iPad Pro M2.');
  requestAnimationFrame(renderScopes);

  // Registrar Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
