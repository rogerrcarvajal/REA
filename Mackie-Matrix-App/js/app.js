/**
 * @file app.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Controlador principal de Mackie Matrix Console M2 para iPad Pro M2:
 *              - Faders Verticales Táctiles Custom (PointerEvents 120Hz) con soporte M / S / Link / EQ sin recorte visual
 *              - Reproducción Real de los 78 MP3 de OBS/Mackie en los 32 Sample Pads (Bancos A, B, C, D)
 *              - Bus de Prueba Multicanal en Vivo para escuchar el efecto real de Faders, Mute, Solo, EQ 5 Bandas y VFX
 *              - Sincronización en tiempo real con `api/bridge.php` y archivos `.mackie` [V1]/[V2]
 */

import { DEFAULT_MACKIE_STATE, parseMackieConfigFile, exportMackieConfigFile } from './mackie-parser.js?v=2.0.0';
import { MackieMatrixDSPEngine } from './dsp-engine.js?v=2.0.0';

document.addEventListener('DOMContentLoaded', async () => {
  let state = structuredClone(DEFAULT_MACKIE_STATE);
  let activeBank = 'A';
  let activeEqPresetName = 'Eq Main Stream';
  let saveTimeout = null;

  const dsp = new MackieMatrixDSPEngine();

  const channelsContainer = document.getElementById('channelsContainer');
  const submixTabsEl = document.getElementById('submixTabs');
  const masterSubmixListEl = document.getElementById('masterSubmixList');
  const eqPresetSelect = document.getElementById('eqPresetSelect');
  const eqBandsGrid = document.getElementById('eqBandsGrid');
  const eqCanvas = document.getElementById('eqCurveCanvas');
  const padsGrid = document.getElementById('padsGrid');
  const statusBanner = document.getElementById('statusBanner');
  const fileInputMackie = document.getElementById('fileInputMackie');
  const btnAudioTest = document.getElementById('btnAudioTest');
  const btnStopAudio = document.getElementById('btnStopAudio');

  function setStatus(msg) {
    statusBanner.textContent = msg;
  }

  // Sincronizar cambios automáticamente con el servidor (`api/bridge.php`)
  function scheduleServerSync() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        await fetch('./api/bridge.php?action=save_state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state,
            mackieText: exportMackieConfigFile(state)
          })
        });
      } catch (_) {}
    }, 350);
  }

  // Recalcular ganancia maestra efectiva en función del Submix activo, canales con Solo/Mute y Faders
  function updateLiveAudioGain() {
    const s = state.selectedSubmix;
    const sub = state.submixes[s];
    if (!sub || sub.mute) {
      dsp.setMasterEffectiveGain(0);
      return;
    }
    const anySolo = state.channels.some((c) => c.solos[s]);
    let activeAvg = 0;
    let count = 0;
    state.channels.forEach((c) => {
      const audible = anySolo ? c.solos[s] && !c.mutes[s] : !c.mutes[s];
      if (audible) {
        activeAvg += c.volumes[s] / 100;
        count++;
      }
    });
    const chFactor = count > 0 ? activeAvg / count : 0;
    const subFactor = sub.volume / 100;
    dsp.setMasterEffectiveGain(chFactor * subFactor);
  }

  // Cargar estado persistido en el Bridge o el backup real `.mackie`
  try {
    const bridgeResp = await fetch('./api/bridge.php?action=status', { cache: 'no-store' });
    if (bridgeResp.ok) {
      const bridgeData = await bridgeResp.json();
      if (bridgeData.ok && bridgeData.savedState && bridgeData.savedState.channels) {
        state = bridgeData.savedState;
        setStatus(`Consola sincronizada en vivo con PC (${bridgeData.soundCount} efectos MP3 listos en iPad Pro M2).`);
      } else {
        const resp = await fetch('./presets/MainStream-Config-Backup-V2.mackie');
        if (resp.ok) {
          const text = await resp.text();
          const parsed = parseMackieConfigFile(text);
          parsed.samples = state.samples; // Conservar enlaces a los 32 MP3 reales
          state = parsed;
          setStatus(`Backup real cargado: MainStream - Config Backup.mackie ([V2] — ${bridgeData.soundCount || 78} MP3 listos)`);
        }
      }
    }
  } catch (_) {
    setStatus('Mackie Matrix Console [V2] activa en iPad Pro M2.');
  }

  // 1. Renderizar Pestañas de los 4 Submixes
  function renderSubmixTabs() {
    submixTabsEl.innerHTML = '';
    state.submixes.forEach((sub, idx) => {
      const btn = document.createElement('button');
      btn.className = 'submix-btn' + (state.selectedSubmix === idx ? ' active' : '');
      btn.innerHTML = `
        <span>SUBMIX ${idx + 1}: ${sub.name.toUpperCase()}</span>
        <small>${sub.outputAudioDeviceName} (${sub.volume}%)</small>
      `;
      btn.addEventListener('click', () => {
        state.selectedSubmix = idx;
        renderSubmixTabs();
        renderChannelStrips();
        renderMasterSubmixColumn();
        updateLiveAudioGain();
        setStatus(`Mezcla activa cambiada a Submix ${idx + 1}: ${sub.outputAudioDeviceName}`);
      });
      submixTabsEl.appendChild(btn);
    });
  }

  // 2. Renderizar los 9 Canales con Custom Touch Vertical Faders (Sin recorte inferior en iPad Pro M2)
  function renderChannelStrips() {
    const s = state.selectedSubmix;
    channelsContainer.innerHTML = '';

    state.channels.forEach((ch, chIdx) => {
      const strip = document.createElement('div');
      strip.className = 'channel-strip';
      strip.style.setProperty('--ch-color', ch.color);

      const vol = ch.volumes[s];
      const isMuted = ch.mutes[s];
      const isSolo = ch.solos[s];
      const isLinked = ch.linked[s];

      strip.innerHTML = `
        <div class="ch-header">
          <div class="ch-icon">${ch.iconEmoji}</div>
          <div class="ch-name" title="${ch.name}">${ch.name}</div>
          <div class="ch-device" title="${ch.inputAudioDeviceName}">${ch.inputAudioDeviceName}</div>
        </div>

        <div class="fader-well">
          <div class="custom-fader-track" data-ch="${chIdx}">
            <div class="custom-fader-fill" id="faderFill_${chIdx}" style="height: calc(${vol}% - 12px);"></div>
            <div class="custom-fader-thumb" id="faderThumb_${chIdx}" style="bottom: calc(${vol}% - 4px);"></div>
          </div>
          <div class="vu-bar-track">
            <div class="vu-bar-fill" id="vuFill_${chIdx}" style="height:${isMuted ? 0 : Math.round(vol * 0.78)}%"></div>
          </div>
        </div>

        <div class="ch-bottom-group">
          <div class="ch-vol-readout" id="volReadout_${chIdx}">${Math.round(vol)}%</div>

          <div class="ch-buttons">
            <button class="ch-mini-btn ${isMuted ? 'mute-on' : ''}" data-action="mute" data-ch="${chIdx}">M</button>
            <button class="ch-mini-btn ${isSolo ? 'solo-on' : ''}" data-action="solo" data-ch="${chIdx}">S</button>
            <button class="ch-mini-btn ${isLinked ? 'link-on' : ''}" data-action="link" data-ch="${chIdx}" title="Enlazar Fader entre Submixes">🔗</button>
          </div>

          <div class="ch-dsp-tags">
            <span class="dsp-pill" data-action="open-eq" data-preset="${ch.eqPreset}">EQ: ${ch.eqPreset}</span>
          </div>
        </div>
      `;

      // Interacción táctil 120Hz (Apple Pencil 2 + Dedo) para el Fader Vertical Custom
      const track = strip.querySelector('.custom-fader-track');
      const fill = strip.querySelector(`#faderFill_${chIdx}`);
      const thumb = strip.querySelector(`#faderThumb_${chIdx}`);
      const readout = strip.querySelector(`#volReadout_${chIdx}`);

      const updateFaderFromPointer = (clientY) => {
        const rect = track.getBoundingClientRect();
        const relY = rect.bottom - clientY;
        const pct = Math.max(0, Math.min(100, Math.round((relY / rect.height) * 100)));
        const delta = pct - ch.volumes[s];
        ch.volumes[s] = pct;

        if (ch.linked[s]) {
          for (let other = 0; other < 4; other++) {
            if (other !== s && ch.linked[other]) {
              ch.volumes[other] = Math.max(0, Math.min(100, ch.volumes[other] + delta));
            }
          }
        }

        fill.style.height = `calc(${pct}% - 12px)`;
        thumb.style.bottom = `calc(${pct}% - 4px)`;
        readout.textContent = `${pct}%`;
        updateLiveAudioGain();
        scheduleServerSync();
      };

      let dragging = false;
      track.addEventListener('pointerdown', (e) => {
        dragging = true;
        track.setPointerCapture(e.pointerId);
        updateFaderFromPointer(e.clientY);
      });
      track.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        updateFaderFromPointer(e.clientY);
      });
      track.addEventListener('pointerup', (e) => {
        dragging = false;
        try { track.releasePointerCapture(e.pointerId); } catch (_) {}
        setStatus(`Canal ${ch.name} ajustado a ${ch.volumes[s]}% en Submix ${s + 1}`);
      });

      // Botones Mute (M), Solo (S) y Link (🔗)
      strip.querySelectorAll('.ch-mini-btn').forEach((b) => {
        b.addEventListener('click', () => {
          const act = b.dataset.action;
          if (act === 'mute') {
            ch.mutes[s] = !ch.mutes[s];
            setStatus(`Canal ${ch.name}: ${ch.mutes[s] ? 'MUTE ACTIVO' : 'AUDIO ACTIVO'}`);
          }
          if (act === 'solo') {
            ch.solos[s] = !ch.solos[s];
            setStatus(`Canal ${ch.name}: ${ch.solos[s] ? 'SOLO ACTIVO' : 'SOLO DESACTIVADO'}`);
          }
          if (act === 'link') {
            ch.linked[s] = !ch.linked[s];
            setStatus(`Canal ${ch.name}: Enlace entre Submixes ${ch.linked[s] ? 'ACTIVADO' : 'DESACTIVADO'}`);
          }
          renderChannelStrips();
          updateLiveAudioGain();
          scheduleServerSync();
        });
      });

      // Botón EQ Preset abre el editor paramétrico de 5 bandas
      strip.querySelector('[data-action="open-eq"]').addEventListener('click', () => {
        if (state.eqPresets[ch.eqPreset]) {
          activeEqPresetName = ch.eqPreset;
          eqPresetSelect.value = activeEqPresetName;
          renderEqEditor();
        }
        switchViewTab('eqView');
      });

      channelsContainer.appendChild(strip);
    });
  }

  // 3. Renderizar Columna Derecha de los 4 Buses Maestros (Submixes 0..3)
  function renderMasterSubmixColumn() {
    masterSubmixListEl.innerHTML = '';
    state.submixes.forEach((sub, idx) => {
      const card = document.createElement('div');
      card.className = 'submix-fader-row';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.72rem;">
          <span style="color:${state.selectedSubmix === idx ? 'var(--accent-mackie)' : 'var(--text-primary)'}">
            ${idx + 1}. ${sub.outputAudioDeviceName}
          </span>
          <span id="subVolVal_${idx}">${sub.volume}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="range" min="0" max="100" value="${sub.volume}" style="flex:1;accent-color:var(--accent-mackie);" />
          <button class="ch-mini-btn ${sub.mute ? 'mute-on' : ''}" style="padding:0 8px;">MUTE</button>
        </div>
      `;
      const slider = card.querySelector('input[type="range"]');
      const valSpan = card.querySelector(`#subVolVal_${idx}`);
      slider.addEventListener('input', (e) => {
        sub.volume = Number(e.target.value);
        valSpan.textContent = `${sub.volume}%`;
        renderSubmixTabs();
        updateLiveAudioGain();
        scheduleServerSync();
      });
      const muteBtn = card.querySelector('button');
      muteBtn.addEventListener('click', () => {
        sub.mute = !sub.mute;
        renderMasterSubmixColumn();
        updateLiveAudioGain();
        scheduleServerSync();
      });
      masterSubmixListEl.appendChild(card);
    });
  }

  // 4. Rack de Efectos Vocales VFX & MVoice Conectados al Grafo DSP Real
  document.querySelectorAll('[data-vfx]').forEach((btn) => {
    const key = btn.dataset.vfx;
    if (state.vfx && state.vfx[key]) {
      btn.classList.add('link-on');
    } else {
      btn.classList.remove('link-on');
    }
    btn.addEventListener('click', () => {
      if (!state.vfx) state.vfx = {};
      state.vfx[key] = !state.vfx[key];
      btn.classList.toggle('link-on', state.vfx[key]);
      dsp.applyVfxState(state.vfx);
      scheduleServerSync();
      setStatus(`Efecto DSP [${btn.textContent.trim()}]: ${state.vfx[key] ? 'ACTIVADO' : 'BYPASS'}`);
    });
  });

  // 5. Editor de EQ Paramétrico de 5 Bandas (`eq_presets`) con Arrastre Táctil en el Lienzo
  function initEqPresetsDropdown() {
    eqPresetSelect.innerHTML = '';
    Object.keys(state.eqPresets).forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === activeEqPresetName) opt.selected = true;
      eqPresetSelect.appendChild(opt);
    });
  }

  function drawEqCurve() {
    const bands = state.eqPresets[activeEqPresetName] || state.eqPresets['Flat'];
    dsp.applyEqBands(bands);

    const ctx = eqCanvas.getContext('2d');
    const w = eqCanvas.width;
    const h = eqCanvas.height;
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0.2, 0.5, 0.8].forEach((ry) => {
      ctx.beginPath();
      ctx.moveTo(0, h * ry);
      ctx.lineTo(w, h * ry);
      ctx.stroke();
    });

    const { totalDb } = dsp.computeFrequencyResponseCurve(bands, 256);

    ctx.strokeStyle = '#9CCC56';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i < totalDb.length; i++) {
      const x = (i / (totalDb.length - 1)) * w;
      const y = h * 0.5 - (totalDb[i] / 18) * (h * 0.42);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(156, 204, 86, 0.14)';
    ctx.fill();

    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    bands.forEach((b, idx) => {
      const nx = ((Math.log10(b.freq) - minLog) / (maxLog - minLog)) * w;
      const ny = h * 0.5 - (b.gain / 18) * (h * 0.42);
      ctx.fillStyle = b.enabled ? '#00F2FE' : '#64748B';
      ctx.beginPath();
      ctx.arc(nx, ny, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`B${idx + 1} (${Math.round(b.freq)}Hz)`, Math.min(w - 82, Math.max(6, nx - 30)), Math.max(14, ny - 12));
    });
  }

  // Permitir arrastrar directamente los nodos B1-B5 en la gráfica con Apple Pencil 2 o dedo
  let draggingBandIdx = -1;
  eqCanvas.addEventListener('pointerdown', (e) => {
    const bands = state.eqPresets[activeEqPresetName] || state.eqPresets['Flat'];
    const rect = eqCanvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * eqCanvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * eqCanvas.height;
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);

    let closest = -1;
    let minDist = 45;
    bands.forEach((b, idx) => {
      const nx = ((Math.log10(b.freq) - minLog) / (maxLog - minLog)) * eqCanvas.width;
      const ny = eqCanvas.height * 0.5 - (b.gain / 18) * (eqCanvas.height * 0.42);
      const dist = Math.hypot(px - nx, py - ny);
      if (dist < minDist) {
        minDist = dist;
        closest = idx;
      }
    });
    if (closest !== -1) {
      draggingBandIdx = closest;
      eqCanvas.setPointerCapture(e.pointerId);
    }
  });

  eqCanvas.addEventListener('pointermove', (e) => {
    if (draggingBandIdx === -1) return;
    const bands = state.eqPresets[activeEqPresetName] || state.eqPresets['Flat'];
    const b = bands[draggingBandIdx];
    const rect = eqCanvas.getBoundingClientRect();
    const normX = Math.max(0.01, Math.min(0.99, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);

    b.freq = Math.round(Math.pow(10, minLog + normX * (maxLog - minLog)));
    b.gain = Number(((0.5 - normY) / 0.42 * 18).toFixed(1));
    b.gain = Math.max(-15, Math.min(15, b.gain));
    renderEqEditor();
    scheduleServerSync();
  });

  eqCanvas.addEventListener('pointerup', () => {
    draggingBandIdx = -1;
  });

  function renderEqEditor() {
    const bands = state.eqPresets[activeEqPresetName] || state.eqPresets['Flat'];
    eqBandsGrid.innerHTML = '';
    const modeNames = { 0: 'Low-Cut / HPF', 1: 'High-Shelf', 2: 'Peaking Bell' };

    bands.forEach((b, idx) => {
      const card = document.createElement('div');
      card.className = 'eq-band-card';
      card.innerHTML = `
        <h4>
          <span>BANDA ${idx + 1}</span>
          <span style="color:var(--accent-mackie);font-size:0.64rem;">${modeNames[b.mode] || 'Bell'}</span>
        </h4>
        <label style="font-size:0.68rem;color:var(--text-secondary);">Frec: <strong id="eqFreqVal_${idx}">${Math.round(b.freq)} Hz</strong></label>
        <input type="range" min="20" max="16000" step="1" value="${b.freq}" data-idx="${idx}" data-prop="freq" />
        <label style="font-size:0.68rem;color:var(--text-secondary);">Gain: <strong id="eqGainVal_${idx}">${b.gain.toFixed(1)} dB</strong></label>
        <input type="range" min="-15" max="15" step="0.1" value="${b.gain}" data-idx="${idx}" data-prop="gain" />
        <label style="font-size:0.68rem;color:var(--text-secondary);">Width (Q): <strong id="eqWidthVal_${idx}">${b.width}</strong></label>
        <input type="range" min="0.5" max="3.0" step="0.1" value="${b.width}" data-idx="${idx}" data-prop="width" />
      `;
      card.querySelectorAll('input[type="range"]').forEach((inp) => {
        inp.addEventListener('input', (e) => {
          const prop = e.target.dataset.prop;
          const val = Number(e.target.value);
          b[prop] = val;
          if (prop === 'freq') card.querySelector(`#eqFreqVal_${idx}`).textContent = `${Math.round(val)} Hz`;
          if (prop === 'gain') card.querySelector(`#eqGainVal_${idx}`).textContent = `${val.toFixed(1)} dB`;
          if (prop === 'width') card.querySelector(`#eqWidthVal_${idx}`).textContent = `${val.toFixed(1)}`;
          drawEqCurve();
          scheduleServerSync();
        });
      });
      eqBandsGrid.appendChild(card);
    });
    drawEqCurve();
  }

  eqPresetSelect.addEventListener('change', () => {
    activeEqPresetName = eqPresetSelect.value;
    renderEqEditor();
  });

  // 6. Renderizar los 32 Sample Pads (Bancos A, B, C, D con audio MP3 real)
  function renderSamplePads() {
    padsGrid.innerHTML = '';
    const list = state.samples[activeBank] || [];
    list.forEach((pad) => {
      const btn = document.createElement('button');
      btn.className = 'sample-pad-btn';
      btn.style.setProperty('--pad-color', pad.color);
      btn.innerHTML = `
        <div style="display:flex;justify-content:space-between;width:100%;font-size:0.68rem;color:var(--text-secondary);">
          <strong>PAD ${pad.id}</strong>
          <span>${pad.hotkey}</span>
        </div>
        <div style="font-size:0.86rem;font-weight:700;color:#fff;">▶ ${pad.name || 'Vacío'}</div>
        <div style="font-size:0.62rem;color:var(--accent-mackie);width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${pad.filePath || 'WebAudio DSP 48kHz'}
        </div>
      `;
      btn.addEventListener('click', () => {
        btn.classList.add('playing');
        const s = state.selectedSubmix;
        const sampleCh = state.channels[8];
        const sampleVol = sampleCh && !sampleCh.mutes[s] ? (sampleCh.volumes[s] / 100) * (state.submixes[s].volume / 100) : 0.85;
        dsp.triggerSamplePad(pad, sampleVol);
        setStatus(`🔊 Reproduciendo Sample Pad [${pad.id}]: ${pad.name}`);
        setTimeout(() => btn.classList.remove('playing'), 650);
      });
      padsGrid.appendChild(btn);
    });
  }

  document.querySelectorAll('[data-bank]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-bank]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeBank = btn.dataset.bank;
      renderSamplePads();
    });
  });

  // Botón de Prueba de Audio en Vivo para probar Faders, Mute, Solo, EQ y VFX
  if (btnAudioTest) {
    btnAudioTest.addEventListener('click', () => {
      const playing = dsp.toggleTestAudioLoop('./sounds/mii-channel-music.mp3');
      updateLiveAudioGain();
      btnAudioTest.textContent = playing ? '⏸ Pausar Audio Test' : '🎵 Probar Audio en Canales';
      setStatus(
        playing
          ? '🔊 Audio de prueba activo: mueve cualquier Fader, Mute, Solo, EQ de 5 Bandas o VFX para escuchar el cambio en tiempo real.'
          : 'Audio de prueba en pausa.'
      );
    });
  }

  if (btnStopAudio) {
    btnStopAudio.addEventListener('click', () => {
      dsp.stopAllSounds();
      if (btnAudioTest) btnAudioTest.textContent = '🎵 Probar Audio en Canales';
      setStatus('⏹ Reproducción de Samples y Bus detenida.');
    });
  }

  function switchViewTab(targetId) {
    document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.view-tab[data-target]').forEach((t) => t.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');
    document.querySelector(`[data-target="${targetId}"]`)?.classList.add('active');
    if (targetId === 'eqView') drawEqCurve();
  }

  document.querySelectorAll('.view-tab[data-target]').forEach((tab) => {
    tab.addEventListener('click', () => switchViewTab(tab.dataset.target));
  });

  // Importar y Exportar archivos `.mackie` reales
  document.getElementById('btnImportMackie').addEventListener('click', () => {
    fileInputMackie.click();
  });

  fileInputMackie.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseMackieConfigFile(text);
    parsed.samples = state.samples;
    state = parsed;
    renderSubmixTabs();
    renderChannelStrips();
    renderMasterSubmixColumn();
    initEqPresetsDropdown();
    renderEqEditor();
    renderSamplePads();
    scheduleServerSync();
    setStatus(`Archivo .mackie importado exitosamente: ${file.name} (Esquema [${state.schemaVersion}])`);
  });

  document.getElementById('btnExportMackie').addEventListener('click', () => {
    const content = exportMackieConfigFile(state);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `MainStream-iPadProM2-${Date.now()}.mackie`;
    a.click();
    setStatus('Configuración exportada en formato nativo .mackie [V2] compatible con Windows e iPadOS.');
  });

  // Animación 120Hz ProMotion de medidores VU respetando Solo / Mute / Fader
  function animateMeters(now) {
    const t = now / 1000;
    const s = state.selectedSubmix;
    const anySolo = state.channels.some((c) => c.solos[s]);

    state.channels.forEach((ch, idx) => {
      const el = document.getElementById(`vuFill_${idx}`);
      if (!el) return;
      const audible = !state.submixes[s].mute && (anySolo ? ch.solos[s] && !ch.mutes[s] : !ch.mutes[s]);
      if (!audible || ch.volumes[s] === 0) {
        el.style.height = '0%';
      } else {
        const base = ch.volumes[s] * 0.72;
        const mod = Math.sin(t * (3.1 + idx * 0.45)) * 10 + Math.cos(t * (5.2 - idx * 0.3)) * 5;
        el.style.height = `${Math.max(4, Math.min(98, base + mod))}%`;
      }
    });
    requestAnimationFrame(animateMeters);
  }

  renderSubmixTabs();
  renderChannelStrips();
  renderMasterSubmixColumn();
  initEqPresetsDropdown();
  renderEqEditor();
  renderSamplePads();
  requestAnimationFrame(animateMeters);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.update()));
  }
});
