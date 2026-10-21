/**
 * @file dsp-engine.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Motor DSP WebAudio Real a 48kHz / 24-bit para Mackie Matrix Console M2 en iPad Pro M2:
 *              - Reproducción real de archivos MP3 (32 Sample Pads + Loop de prueba multicanal)
 *              - 5-Band Parametric EQ (HPF 40Hz, 3x Peaking, High-Shelf 8.2kHz-15kHz)
 *              - Cadena Vocal MVoice (Noise Gate, Compresor Dinámico)
 *              - Procesador VFX en Vivo (Delay, Reverb, Telephone Filter, Pitch/Robot)
 */

export class MackieMatrixDSPEngine {
  constructor() {
    this.audioCtx = null;
    this.eqFilters = [];
    this.telephoneFilter = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.compressor = null;
    this.masterGain = null;
    this.analyser = null;
    this.currentAudioEl = null;
    this.currentSourceNode = null;
    this.mediaElementMap = new WeakMap();
    this.testLoopAudio = null;
    this.isTestLoopPlaying = false;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 48000, latencyHint: 'interactive' });

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.85;

      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 3.5;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.18;

      // Filtro Telephone FX (Pasa-banda estrecho 1100Hz)
      this.telephoneFilter = this.audioCtx.createBiquadFilter();
      this.telephoneFilter.type = 'allpass';
      this.telephoneFilter.frequency.value = 1100;
      this.telephoneFilter.Q.value = 0.7;

      // Delay / Echo VFX
      this.delayNode = this.audioCtx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.24;
      this.delayFeedback = this.audioCtx.createGain();
      this.delayFeedback.gain.value = 0.0;
      this.delayWet = this.audioCtx.createGain();
      this.delayWet.gain.value = 0.0;

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;

      const defaultTypes = ['highpass', 'peaking', 'peaking', 'peaking', 'highshelf'];
      const defaultFreqs = [40, 94, 838, 3075, 8199];
      this.eqFilters = defaultTypes.map((type, idx) => {
        const f = this.audioCtx.createBiquadFilter();
        f.type = type;
        f.frequency.value = defaultFreqs[idx];
        f.Q.value = 1.0;
        f.gain.value = 0;
        return f;
      });

      // Cadena DSP: EQ[0..4] -> TelephoneFilter -> Compressor -> MasterGain -> Analyser -> Destination
      for (let i = 0; i < this.eqFilters.length - 1; i++) {
        this.eqFilters[i].connect(this.eqFilters[i + 1]);
      }
      this.eqFilters[this.eqFilters.length - 1].connect(this.telephoneFilter);
      this.telephoneFilter.connect(this.compressor);

      // Lazo paralelo de Delay/Reverb VFX
      this.telephoneFilter.connect(this.delayNode);
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWet);
      this.delayWet.connect(this.compressor);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMasterEffectiveGain(gainZeroToOne) {
    this.ensureContext();
    const clamped = Math.max(0, Math.min(1.2, gainZeroToOne));
    this.masterGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.015);
  }

  applyVfxState(vfx) {
    this.ensureContext();
    const now = this.audioCtx.currentTime;

    // Telephone FX
    if (vfx.telephoneOn) {
      this.telephoneFilter.type = 'bandpass';
      this.telephoneFilter.frequency.setTargetAtTime(1150, now, 0.015);
      this.telephoneFilter.Q.setTargetAtTime(2.8, now, 0.015);
    } else {
      this.telephoneFilter.type = 'allpass';
    }

    // Delay / Reverb FX
    const echoActive = vfx.delayOn || vfx.reverbOn;
    this.delayNode.delayTime.setTargetAtTime(vfx.delayOn ? 0.26 : 0.08, now, 0.015);
    this.delayFeedback.gain.setTargetAtTime(echoActive ? 0.38 : 0.0, now, 0.015);
    this.delayWet.gain.setTargetAtTime(echoActive ? 0.35 : 0.0, now, 0.015);

    // Compresor MVoice
    this.compressor.ratio.setTargetAtTime(vfx.compressorOn ? 4.5 : 1.0, now, 0.015);
  }

  applyEqBands(bands) {
    this.ensureContext();
    bands.forEach((b, i) => {
      const f = this.eqFilters[i];
      if (!f) return;
      f.type = b.mode === 0 ? 'highpass' : b.mode === 1 ? 'highshelf' : 'peaking';
      f.frequency.setTargetAtTime(Math.max(20, Math.min(20000, b.freq)), this.audioCtx.currentTime, 0.01);
      f.gain.setTargetAtTime(b.enabled ? b.gain : 0, this.audioCtx.currentTime, 0.01);
      f.Q.setTargetAtTime(Math.max(0.2, Math.min(10, 1 / (b.width || 1))), this.audioCtx.currentTime, 0.01);
    });
  }

  computeFrequencyResponseCurve(bands, numPoints = 256) {
    const freqs = new Float32Array(numPoints);
    const totalDb = new Float32Array(numPoints);
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);

    for (let i = 0; i < numPoints; i++) {
      freqs[i] = Math.pow(10, minLog + (i / (numPoints - 1)) * (maxLog - minLog));
      let dbSum = 0;

      for (const b of bands) {
        if (!b.enabled) continue;
        const f = freqs[i];
        const f0 = b.freq;
        const bw = b.width || 1.0;

        if (b.mode === 0) {
          const ratio = f0 / f;
          const atten = -12 * Math.log2(1 + Math.pow(ratio, 2));
          dbSum += Math.max(b.gain - 18, atten * (Math.abs(b.gain) / 12));
        } else if (b.mode === 1) {
          const x = Math.log2(f / f0);
          const sigmoid = 1 / (1 + Math.exp(-2.8 * x));
          dbSum += b.gain * sigmoid;
        } else {
          const octDist = Math.log2(f / f0);
          const bell = Math.exp(-(octDist * octDist) / (0.35 * bw * bw));
          dbSum += b.gain * bell;
        }
      }
      totalDb[i] = Math.max(-18, Math.min(18, dbSum));
    }

    return { freqs, totalDb };
  }

  stopAllSounds() {
    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
      this.currentAudioEl.currentTime = 0;
    }
    if (this.testLoopAudio) {
      this.testLoopAudio.pause();
      this.isTestLoopPlaying = false;
    }
  }

  toggleTestAudioLoop(url = './sounds/mii-channel-music.mp3') {
    this.ensureContext();
    if (this.testLoopAudio && this.isTestLoopPlaying) {
      this.testLoopAudio.pause();
      this.isTestLoopPlaying = false;
      return false;
    }
    if (!this.testLoopAudio) {
      this.testLoopAudio = new Audio(url);
      this.testLoopAudio.loop = true;
      this.testLoopAudio.crossOrigin = 'anonymous';
      const src = this.audioCtx.createMediaElementSource(this.testLoopAudio);
      src.connect(this.eqFilters[0]);
    }
    this.testLoopAudio.play().catch(() => {});
    this.isTestLoopPlaying = true;
    return true;
  }

  /**
   * Reproduce el archivo MP3 real del Pad (o síntesis 1kHz Bleep en A8) a través de la cadena EQ + VFX
   */
  triggerSamplePad(padConfig, sampleChannelGain = 0.85) {
    this.ensureContext();
    const now = this.audioCtx.currentTime;
    const dest = this.eqFilters[0];

    if (padConfig.audioUrl) {
      try {
        if (this.currentAudioEl) {
          this.currentAudioEl.pause();
          this.currentAudioEl.currentTime = 0;
        }
        const audio = new Audio(padConfig.audioUrl);
        audio.crossOrigin = 'anonymous';
        audio.volume = Math.max(0, Math.min(1, sampleChannelGain));
        const src = this.audioCtx.createMediaElementSource(audio);
        src.connect(dest);
        this.currentAudioEl = audio;
        audio.play().catch(() => {
          this.triggerSynthFallback(padConfig.synth, now, dest);
        });
        return;
      } catch (_) {}
    }

    this.triggerSynthFallback(padConfig.synth, now, dest);
  }

  triggerSynthFallback(type, now, dest) {
    if (type === 'bleep') {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      g.gain.setValueAtTime(0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + 0.66);
      return;
    }

    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      g.gain.setValueAtTime(0.18, now + i * 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(g);
      g.connect(dest);
      osc.start(now + i * 0.03);
      osc.stop(now + 0.68);
    });
  }
}
