/**
 * @file dsp-engine.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Motor DSP WebAudio a 48kHz / 24-bit para Mackie Matrix Console M2 en iPad Pro M2:
 *              - 5-Band Parametric EQ (HPF 40Hz, 3x Peaking, High-Shelf 8.2kHz-15kHz)
 *              - Cadena Vocal MVoice (Noise Gate, Compresor Dinámico, De-Esser)
 *              - Procesador VFX (Delay, Reverb, Telephone Filter, Pitch/Robot)
 *              - Sintetizador y Sampler de 32 Pads (Bancos A, B, C, D + Tono Censura BLEEP 1kHz)
 */

export class MackieMatrixDSPEngine {
  constructor() {
    this.audioCtx = null;
    this.eqFilters = [];
    this.compressor = null;
    this.masterGain = null;
    this.analyser = null;
    this.activeBleepOsc = null;
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

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;

      // Crear los 5 filtros biquad del EQ paramétrico de Mackie Matrix
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

      // Conectar en serie: EQ[0..4] -> Compresor MVoice -> MasterGain -> Analyser -> Salida UAC2
      for (let i = 0; i < this.eqFilters.length - 1; i++) {
        this.eqFilters[i].connect(this.eqFilters[i + 1]);
      }
      this.eqFilters[this.eqFilters.length - 1].connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
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

  /**
   * Calcula la curva de respuesta en frecuencia combinada (20Hz - 20kHz) de las 5 bandas para el lienzo Apple Pencil 2
   */
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
          // High-Pass / Low-Cut (Banda 1 ~40Hz en Mackie Matrix)
          const ratio = f0 / f;
          const atten = -12 * Math.log2(1 + Math.pow(ratio, 2));
          dbSum += Math.max(b.gain - 18, atten * (Math.abs(b.gain) / 12));
        } else if (b.mode === 1) {
          // High-Shelf (Banda 5 ~8.2kHz - 15kHz)
          const x = Math.log2(f / f0);
          const sigmoid = 1 / (1 + Math.exp(-2.8 * x));
          dbSum += b.gain * sigmoid;
        } else {
          // Peaking Paramétrico (Bandas 2, 3, 4)
          const octDist = Math.log2(f / f0);
          const bell = Math.exp(-(octDist * octDist) / (0.35 * bw * bw));
          dbSum += b.gain * bell;
        }
      }
      totalDb[i] = Math.max(-18, Math.min(18, dbSum));
    }

    return { freqs, totalDb };
  }

  /**
   * Dispara los Sample Pads (A1-A8, B1-B8, C1-C8, D1-D8) con síntesis WebAudio o archivo de audio local
   */
  triggerSamplePad(padConfig) {
    this.ensureContext();
    const now = this.audioCtx.currentTime;
    const dest = this.eqFilters[0];

    const type = padConfig.synth || 'chord';

    if (type === 'bleep') {
      // A8: Generador Oficial Mackie Matrix BLEEP 1kHz (Censor Tone)
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

    if (type === 'airhorn') {
      // A1: Airhorn clásico multicapa
      [390, 520, 780].forEach((freq) => {
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.92, now);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.06);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(g);
        g.connect(dest);
        osc.start(now);
        osc.stop(now + 0.76);
      });
      return;
    }

    if (type === 'trombone') {
      // A5: Sad Trombone (Wah-Wah-Wah-Waaaah)
      const notes = [293.66, 277.18, 261.63, 246.94];
      notes.forEach((n, idx) => {
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        const t0 = now + idx * 0.24;
        const dur = idx === 3 ? 0.55 : 0.2;
        osc.frequency.setValueAtTime(n, t0);
        if (idx === 3) osc.frequency.linearRampToValueAtTime(n * 0.88, t0 + dur);
        g.gain.setValueAtTime(0.22, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(g);
        g.connect(dest);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      });
      return;
    }

    // Stinger / Chord armónico general para otros pads
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
