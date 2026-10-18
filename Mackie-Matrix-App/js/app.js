/**
 * @file app.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Controlador principal de Mackie Matrix Console M2 para iPad Pro M2:
 *              - Matriz 9 Canales x 4 Submixes con Link/Unlink, Mute, Solo y medidores 120Hz
 *              - Importador/Exportador en vivo de archivos `.mackie` ([V1] y [V2])
 *              - Editor Interactivo de EQ Paramétrico de 5 Bandas (compatible con Apple Pencil 2)
 *              - Sampler de 32 Pads (Bancos A, B, C, D) + Efectos VFX
 */

import { DEFAULT_MACKIE_STATE, parseMackieConfigFile, exportMackieConfigFile } from './mackie-parser.js';
import { MackieMatrixDSPEngine } from './dsp-engine.js';

document.addEventListener('DOMContentLoaded', async () => {
  let state = structuredClone(DEFAULT_MACKIE_STATE);
  let activeBank = 'A';
  let activeEqPresetName = 'Eq Main Stream';

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

  function setStatus(msg) {
    statusBanner.textContent = msg;
  }

  // Cargar automáticamente el backup real V2 del usuario copiado en ./presets/MainStream-Config-Backup-V2.mackie
  try {
    const resp = await fetch('./presets/MainStream-Config-Backup-V2.mackie');
    if (resp.ok) {
      const text = await resp.text();
      state = parseMackieConfigFile(text);
      setStatus('Backup real cargado: MainStream - Config Backup.mackie ([V2] — 9 Canales / 4 Submixes / 32 Pads)');
    }
  } catch (_) {
    setStatus('Estado predeterminado Mackie Matrix [V2] activo.');
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
        setStatus(`Editando mezcla independiente para: ${sub.outputAudioDeviceName}`);
      });
      submixTabsEl.appendChild(btn);
    });
  }

  // 2. Renderizar los 9 Canales de Entrada (3 Hardware + 5 Virtuales + 1 Samples)
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
          <input type="range" min="0" max="100" value="${vol}" class="v-fader" data-ch="${chIdx}" />
          <div class="vu-bar-track">
            <div class="vu-bar-fill" id="vuFill_${chIdx}" style="height:${isMuted ? 0 : Math.round(vol * 0.78)}%"></div>
          </div>
        </div>

        <div class="ch-vol-readout" id="volReadout_${chIdx}">${vol}%</div>

        <div class="ch-buttons">
          <button class="ch-mini-btn ${isMuted ? 'mute-on' : ''}" data-action="mute" data-ch="${chIdx}">M</button>
          <button class="ch-mini-btn ${isSolo ? 'solo-on' : ''}" data-action="solo" data-ch="${chIdx}">S</button>
          <button class="ch-mini-btn ${isLinked ? 'link-on' : ''}" data-action="link" data-ch="${chIdx}" title="Link Fader across Submixes">🔗</button>
        </div>

        <div class="ch-dsp-tags">
          <span class="dsp-pill" data-action="open-eq" data-preset="${ch.eqPreset}">${ch.eqPreset}</span>
        </div>
      `;

      // Evento Fader (con soporte para `linked_0..3` igual que Mackie Matrix en Windows)
      const fader = strip.querySelector('.v-fader');
      const readout = strip.querySelector(`#volReadout_${chIdx}`);
      fader.addEventListener('input', (e) => {
        const newVal = Number(e.target.value);
        const delta = newVal - ch.volumes[s];
        ch.volumes[s] = newVal;
        if (ch.linked[s]) {
          for (let other = 0; other < 4; other++) {
            if (other !== s && ch.linked[other]) {
              ch.volumes[other] = Math.max(0, Math.min(100, ch.volumes[other] + delta));
            }
          }
        }
        readout.textContent = `${newVal}%`;
      });

      // Botones Mute / Solo / Link
      strip.querySelectorAll('.ch-mini-btn').forEach((b) => {
        b.addEventListener('click', () => {
          const act = b.dataset.action;
          if (act === 'mute') ch.mutes[s] = !ch.mutes[s];
          if (act === 'solo') ch.solos[s] = !ch.solos[s];
          if (act === 'link') ch.linked[s] = !ch.linked[s];
          renderChannelStrips();
        });
      });

      // Pill de EQ abre directamente la pestaña de EQ Paramétrico de 5 Bandas
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
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.74rem;">
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
      });
      const muteBtn = card.querySelector('button');
      muteBtn.addEventListener('click', () => {
        sub.mute = !sub.mute;
        renderMasterSubmixColumn();
      });
      masterSubmixListEl.appendChild(card);
    });
  }

  // 4. Editor de EQ Paramétrico de 5 Bandas (`eq_presets`)
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

    // Rejilla logarítmica 20Hz - 20kHz y líneas de ganancia (-18dB a +18dB)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0.2, 0.5, 0.8].forEach((ry) => {
      ctx.beginPath();
      ctx.moveTo(0, h * ry);
      ctx.lineTo(w, h * ry);
      ctx.stroke();
    });

    const { freqs, totalDb } = dsp.computeFrequencyResponseCurve(bands, 256);

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

    // Relleno bajo la curva
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(156, 204, 86, 0.14)';
    ctx.fill();

    // Nodos de las 5 bandas
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    bands.forEach((b, idx) => {
      const nx = ((Math.log10(b.freq) - minLog) / (maxLog - minLog)) * w;
      const ny = h * 0.5 - (b.gain / 18) * (h * 0.42);
      ctx.fillStyle = b.enabled ? '#00F2FE' : '#64748B';
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`B${idx + 1} (${Math.round(b.freq)}Hz)`, Math.min(w - 75, Math.max(6, nx - 28)), Math.max(14, ny - 10));
    });
  }

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
          <span style="color:var(--accent-mackie);font-size:0.66rem;">${modeNames[b.mode] || 'Bell'}</span>
        </h4>
        <label style="font-size:0.7rem;color:var(--text-secondary);">Frecuencia: <strong id="eqFreqVal_${idx}">${b.freq.toFixed(1)} Hz</strong></label>
        <input type="range" min="20" max="16000" step="1" value="${b.freq}" data-idx="${idx}" data-prop="freq" />
        <label style="font-size:0.7rem;color:var(--text-secondary);">Ganancia: <strong id="eqGainVal_${idx}">${b.gain.toFixed(2)} dB</strong></label>
        <input type="range" min="-15" max="15" step="0.1" value="${b.gain}" data-idx="${idx}" data-prop="gain" />
        <label style="font-size:0.7rem;color:var(--text-secondary);">Ancho (Q/Width): <strong id="eqWidthVal_${idx}">${b.width}</strong></label>
        <input type="range" min="0.5" max="3.0" step="0.1" value="${b.width}" data-idx="${idx}" data-prop="width" />
      `;
      card.querySelectorAll('input[type="range"]').forEach((inp) => {
        inp.addEventListener('input', (e) => {
          const prop = e.target.dataset.prop;
          const val = Number(e.target.value);
          b[prop] = val;
          if (prop === 'freq') card.querySelector(`#eqFreqVal_${idx}`).textContent = `${val.toFixed(0)} Hz`;
          if (prop === 'gain') card.querySelector(`#eqGainVal_${idx}`).textContent = `${val.toFixed(1)} dB`;
          if (prop === 'width') card.querySelector(`#eqWidthVal_${idx}`).textContent = `${val.toFixed(1)}`;
          drawEqCurve();
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

  // 5. Renderizar los 32 Sample Pads (Bancos A, B, C, D extraídos del archivo `.mackie` del usuario)
  function renderSamplePads() {
    padsGrid.innerHTML = '';
    const list = state.samples[activeBank] || [];
    list.forEach((pad) => {
      const btn = document.createElement('button');
      btn.className = 'sample-pad-btn';
      btn.style.setProperty('--pad-color', pad.color);
      btn.innerHTML = `
        <div style="display:flex;justify-content:space-between;width:100%;font-size:0.7rem;color:var(--text-secondary);">
          <strong>PAD ${pad.id}</strong>
          <span>${pad.hotkey}</span>
        </div>
        <div style="font-size:0.88rem;font-weight:700;color:#fff;">${pad.name || 'Vacío'}</div>
        <div style="font-size:0.64rem;color:var(--text-muted);width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${pad.filePath || 'WebAudio Synth Ready'}
        </div>
      `;
      btn.addEventListener('click', () => {
        btn.classList.add('playing');
        dsp.triggerSamplePad(pad);
        setStatus(`Reproduciendo Sample Pad [${pad.id}]: ${pad.name} (${pad.filePath || 'Síntesis DSP 48kHz'})`);
        setTimeout(() => btn.classList.remove('playing'), 550);
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

  // Navegación entre vistas principales (Mezclador 9x4 / EQ Paramétrico 5-Band & MVoice / 32 Sample Pads)
  function switchViewTab(targetId) {
    document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.view-tab').forEach((t) => t.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');
    document.querySelector(`[data-target="${targetId}"]`)?.classList.add('active');
    if (targetId === 'eqView') drawEqCurve();
  }

  document.querySelectorAll('.view-tab').forEach((tab) => {
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
    state = parseMackieConfigFile(text);
    renderSubmixTabs();
    renderChannelStrips();
    renderMasterSubmixColumn();
    initEqPresetsDropdown();
    renderEqEditor();
    renderSamplePads();
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

  // Animación 120Hz ProMotion de medidores VU por canal
  function animateMeters(now) {
    const t = now / 1000;
    const s = state.selectedSubmix;
    state.channels.forEach((ch, idx) => {
      const el = document.getElementById(`vuFill_${idx}`);
      if (!el) return;
      if (ch.mutes[s] || state.submixes[s].mute) {
        el.style.height = '0%';
      } else {
        const base = ch.volumes[s] * 0.72;
        const mod = Math.sin(t * (3.1 + idx * 0.45)) * 11 + Math.cos(t * (5.2 - idx * 0.3)) * 6;
        el.style.height = `${Math.max(4, Math.min(98, base + mod))}%`;
      }
    });
    requestAnimationFrame(animateMeters);
  }

  // Inicializar toda la consola
  renderSubmixTabs();
  renderChannelStrips();
  renderMasterSubmixColumn();
  initEqPresetsDropdown();
  renderEqEditor();
  renderSamplePads();
  requestAnimationFrame(animateMeters);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
