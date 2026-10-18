/**
 * @file mackie-parser.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Parser y Serializador nativo para archivos de configuración `.mackie` (Esquemas [V1] y [V2] Qt QSettings INI)
 *              reconstruido mediante REA a partir de `Mackie Matrix.exe` y `MainStream - Config Backup.mackie`.
 */

export const DEFAULT_MACKIE_STATE = {
  schemaVersion: 'V2',
  selectedSubmix: 0,
  submixes: [
    { id: 0, name: 'Hardware Out', outputAudioDeviceName: 'Audio Output (2- MainStream)', volume: 85, mute: false, solo: false, monitor: false },
    { id: 1, name: 'Monitor Mix', outputAudioDeviceName: 'Monitor Mix - Mackie Matrix', volume: 86, mute: false, solo: false, monitor: false },
    { id: 2, name: 'Virtual Mix 1', outputAudioDeviceName: 'Virtual Mix 1 - Mackie Matrix', volume: 78, mute: false, solo: false, monitor: false },
    { id: 3, name: 'Virtual Mix 2', outputAudioDeviceName: 'Virtual Mix 2 - Mackie Matrix', volume: 74, mute: false, solo: false, monitor: false }
  ],
  channels: [
    {
      key: 'Audio Input (2- MainStream)',
      name: 'Main Stream',
      inputAudioDeviceName: 'Audio Input (2- MainStream)',
      iconID: 1,
      iconEmoji: '🎙️',
      color: '#9ccc56',
      volumes: [100, 100, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, true, true],
      eqPreset: 'Eq Main Stream',
      mvoiceEnabled: true
    },
    {
      key: 'Microphone (Maono PD200W Mic USB)',
      name: 'Maono PD 200W',
      inputAudioDeviceName: 'Microphone (Maono PD200W Mic USB)',
      iconID: 1,
      iconEmoji: '🎤',
      color: '#4eb96c',
      volumes: [70, 70, 70, 70],
      mutes: [true, true, true, true],
      solos: [false, false, false, false],
      linked: [false, false, false, false],
      eqPreset: 'Flat',
      mvoiceEnabled: true
    },
    {
      key: 'CABLE Output (VB-Audio Virtual Cable)',
      name: 'Audio Auxiliar',
      inputAudioDeviceName: 'CABLE Output (VB-Audio Virtual Cable)',
      iconID: 1,
      iconEmoji: '🔌',
      color: '#85cca9',
      volumes: [70, 70, 70, 70],
      mutes: [true, true, true, true],
      solos: [false, false, false, false],
      linked: [false, false, false, false],
      eqPreset: 'Flat',
      mvoiceEnabled: false
    },
    {
      key: 'Game',
      name: 'Game',
      inputAudioDeviceName: 'Virtual input A',
      iconID: 9,
      iconEmoji: '🎮',
      color: '#ea1a5b',
      volumes: [93, 93, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, false, false],
      eqPreset: 'Eq Mix Atream 1',
      mvoiceEnabled: false
    },
    {
      key: 'Chat',
      name: 'Chat',
      inputAudioDeviceName: 'Virtual input B',
      iconID: 5,
      iconEmoji: '💬',
      color: '#f0582a',
      volumes: [75, 75, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, false, false],
      eqPreset: 'Flat',
      mvoiceEnabled: false
    },
    {
      key: 'Music',
      name: 'Music',
      inputAudioDeviceName: 'Virtual input C',
      iconID: 15,
      iconEmoji: '🎵',
      color: '#ffc909',
      volumes: [92, 92, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, false, false],
      eqPreset: 'Eq Monitoring',
      mvoiceEnabled: false
    },
    {
      key: 'Browser',
      name: 'Browser',
      inputAudioDeviceName: 'Virtual input D',
      iconID: 17,
      iconEmoji: '🌐',
      color: '#a276b3',
      volumes: [86, 86, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, false, false],
      eqPreset: 'Eq Mix Atream 1',
      mvoiceEnabled: true
    },
    {
      key: 'System',
      name: 'System',
      inputAudioDeviceName: 'Virtual input E',
      iconID: 10,
      iconEmoji: '🖥️',
      color: '#64cbe5',
      volumes: [100, 100, 100, 100],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, false, false],
      eqPreset: 'Eq Submix Output - VM2',
      mvoiceEnabled: false
    },
    {
      key: 'Samples',
      name: 'Samples',
      inputAudioDeviceName: 'Samples',
      iconID: 13,
      iconEmoji: '🎹',
      color: '#9ccc56',
      volumes: [68, 70, 70, 70],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [false, false, false, false],
      eqPreset: 'Flat',
      mvoiceEnabled: true
    }
  ],
  eqPresets: {
    'Eq Main Stream': [
      { idx: 0, mode: 0, type: 'highpass', freq: 39.98, gain: -11.89, width: 1.0, enabled: true },
      { idx: 1, mode: 2, type: 'peaking', freq: 80.51, gain: 5.87, width: 1.0, enabled: true },
      { idx: 2, mode: 2, type: 'peaking', freq: 486.08, gain: -4.32, width: 1.5, enabled: true },
      { idx: 3, mode: 2, type: 'peaking', freq: 2600.89, gain: 4.00, width: 1.5, enabled: true },
      { idx: 4, mode: 1, type: 'highshelf', freq: 8199.18, gain: 7.73, width: 1.0, enabled: true }
    ],
    'Eq Mix Atream 1': [
      { idx: 0, mode: 0, type: 'highpass', freq: 39.98, gain: -11.89, width: 1.0, enabled: true },
      { idx: 1, mode: 2, type: 'peaking', freq: 94.11, gain: 6.24, width: 1.0, enabled: true },
      { idx: 2, mode: 2, type: 'peaking', freq: 838.36, gain: -2.83, width: 1.5, enabled: true },
      { idx: 3, mode: 2, type: 'peaking', freq: 3075.32, gain: 5.49, width: 1.5, enabled: true },
      { idx: 4, mode: 1, type: 'highshelf', freq: 8199.18, gain: 7.73, width: 1.0, enabled: true }
    ],
    'Eq Monitoring': [
      { idx: 0, mode: 0, type: 'highpass', freq: 39.98, gain: -11.89, width: 1.0, enabled: true },
      { idx: 1, mode: 2, type: 'peaking', freq: 94.11, gain: 6.24, width: 1.0, enabled: true },
      { idx: 2, mode: 2, type: 'peaking', freq: 838.36, gain: -2.83, width: 1.5, enabled: true },
      { idx: 3, mode: 2, type: 'peaking', freq: 3075.32, gain: 5.49, width: 1.5, enabled: true },
      { idx: 4, mode: 1, type: 'highshelf', freq: 8199.18, gain: 7.73, width: 1.0, enabled: true }
    ],
    'Eq Submix Output - VM2': [
      { idx: 0, mode: 0, type: 'highpass', freq: 39.98, gain: -11.89, width: 1.0, enabled: true },
      { idx: 1, mode: 2, type: 'peaking', freq: 94.11, gain: 6.24, width: 1.0, enabled: true },
      { idx: 2, mode: 2, type: 'peaking', freq: 838.36, gain: -2.83, width: 1.5, enabled: true },
      { idx: 3, mode: 2, type: 'peaking', freq: 3075.32, gain: 5.49, width: 1.5, enabled: true },
      { idx: 4, mode: 1, type: 'highshelf', freq: 8199.18, gain: 7.73, width: 1.0, enabled: true }
    ],
    'Flat': [
      { idx: 0, mode: 0, type: 'highpass', freq: 50, gain: 0, width: 1.0, enabled: true },
      { idx: 1, mode: 2, type: 'peaking', freq: 100, gain: 0, width: 1.0, enabled: true },
      { idx: 2, mode: 2, type: 'peaking', freq: 1000, gain: 0, width: 1.0, enabled: true },
      { idx: 3, mode: 2, type: 'peaking', freq: 10000, gain: 0, width: 1.0, enabled: true },
      { idx: 4, mode: 1, type: 'highshelf', freq: 15000, gain: 0, width: 1.0, enabled: true }
    ]
  },
  samples: {
    A: [
      { id: 'A1', name: 'Airhorn', color: '#9ccc56', synth: 'airhorn', hotkey: 'F1', filePath: ':/resources/sounds/airhorn.wav' },
      { id: 'A2', name: 'Scream', color: '#4eb96c', synth: 'scream', hotkey: 'F2', filePath: ':/resources/sounds/scream.wav' },
      { id: 'A3', name: 'Applause', color: '#85cca9', synth: 'applause', hotkey: 'F3', filePath: ':/resources/sounds/applause.wav' },
      { id: 'A4', name: 'Laughter', color: '#64cbe5', synth: 'laughter', hotkey: 'F4', filePath: ':/resources/sounds/laughter.wav' },
      { id: 'A5', name: 'Sad Trombone', color: '#a276b3', synth: 'trombone', hotkey: 'F5', filePath: ':/resources/sounds/trombone.wav' },
      { id: 'A6', name: 'Crickets', color: '#ee3524', synth: 'crickets', hotkey: 'F6', filePath: ':/resources/sounds/crickets.wav' },
      { id: 'A7', name: 'After Dark', color: '#ffc909', synth: 'chord', hotkey: 'F7', filePath: ':/resources/sounds/mackie_theme.wav' },
      { id: 'A8', name: 'BLEEP 1kHz', color: '#ee3524', synth: 'bleep', hotkey: 'F8', filePath: ':/resources/sounds/bleep_1k.wav' }
    ],
    B: [
      { id: 'B1', name: 'Directes by Robert', color: '#9ccc56', synth: 'chord', hotkey: 'F9', filePath: 'D:/OBS/Efectos de Sonido/directed-by-robert.mp3' },
      { id: 'B2', name: 'Cell sintio terror', color: '#4eb96c', synth: 'subdrop', hotkey: 'F10', filePath: 'D:/OBS/Efectos de Sonido/en-ese-momento-cell-sintio-el-verdadero-terror-v-descarga.mp3' },
      { id: 'B3', name: 'Alguien con vida', color: '#85cca9', synth: 'sonar', hotkey: 'F11', filePath: 'D:/OBS/Efectos de Sonido/hay-alguien-ahi-con-vida-larga.mp3' },
      { id: 'B4', name: 'Como estan (Dross)', color: '#9ccc56', synth: 'stinger', hotkey: 'F12', filePath: 'D:/OBS/Efectos de Sonido/hola-cono-de-sus-madres-dross.mp3' },
      { id: 'B5', name: 'La vida es un carrusel', color: '#a276b3', synth: 'arp', hotkey: 'PAD5', filePath: 'D:/OBS/Efectos de Sonido/la-vida-es-un-carrusel.mp3' },
      { id: 'B6', name: 'Sala de espera', color: '#ee3524', synth: 'lofi', hotkey: 'PAD6', filePath: 'D:/OBS/Efectos de Sonido/o-sonidos-de-espera.mp3' },
      { id: 'B7', name: 'Patria y mas Patria', color: '#f6ec3b', synth: 'brass', hotkey: 'PAD7', filePath: 'D:/OBS/Efectos de Sonido/patria.mp3' },
      { id: 'B8', name: 'Apareciste (Picoro)', color: '#ee3524', synth: 'impact', hotkey: 'PAD8', filePath: 'D:/OBS/Efectos de Sonido/por-fin-apareciste-malnacido-picoro.mp3' }
    ],
    C: Array.from({ length: 8 }, (_, i) => ({
      id: `C${i + 1}`,
      name: `Custom C${i + 1}`,
      color: '#64cbe5',
      synth: 'sonar',
      hotkey: `C${i + 1}`,
      filePath: ''
    })),
    D: Array.from({ length: 8 }, (_, i) => ({
      id: `D${i + 1}`,
      name: `Custom D${i + 1}`,
      color: '#a276b3',
      synth: 'arp',
      hotkey: `D${i + 1}`,
      filePath: ''
    }))
  },
  vfx: {
    delayOn: false,
    delayTime: 280,
    delayFeedback: 35,
    delayLevel: 25,
    reverbOn: false,
    reverbDecay: 1.8,
    reverbLevel: 22,
    telephoneOn: false,
    voiceFxOn: false,
    pitchShift: 0,
    robotVoice: false
  }
};

const ICON_EMOJI_MAP = {
  1: '🎙️',
  5: '💬',
  9: '🎮',
  10: '🖥️',
  13: '🎹',
  15: '🎵',
  17: '🌐'
};

/**
 * Parsea un archivo `.mackie` real ([V1] o [V2]) y devuelve un estado estructurado para Mackie Matrix M2
 */
export function parseMackieConfigFile(rawText) {
  const state = structuredClone(DEFAULT_MACKIE_STATE);
  const lines = rawText.split(/\r?\n/);

  const rawMap = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';')) continue;
    if (trimmed === '[V1]' || trimmed === '[V2]') {
      state.schemaVersion = trimmed.replace(/[\[\]]/g, '');
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    rawMap[key] = val;
  }

  // Actualizar volúmenes de submixes (submixes\0..3\volume)
  for (let s = 0; s < 4; s++) {
    const vol = rawMap[`submixes\\${s}\\volume`];
    const mute = rawMap[`submixes\\${s}\\mute`];
    const solo = rawMap[`submixes\\${s}\\solo`];
    const outName = rawMap[`submixes\\${s}\\outputAudioDeviceName`];
    if (vol !== undefined) state.submixes[s].volume = Number(vol);
    if (mute !== undefined) state.submixes[s].mute = mute === 'true';
    if (solo !== undefined) state.submixes[s].solo = solo === 'true';
    if (outName) state.submixes[s].outputAudioDeviceName = outName;
  }

  // Actualizar canales actuales (channels_current\<encodedKey>\<prop>)
  state.channels.forEach((ch) => {
    const encodedKey = encodeURIComponent(ch.key).replace(/\(/g, '%28').replace(/\)/g, '%29');
    const prefixCandidates = [
      `channels_current\\${encodedKey}`,
      `channels_current\\${ch.key}`
    ];
    for (const prefix of prefixCandidates) {
      if (rawMap[`${prefix}\\name`]) {
        ch.name = rawMap[`${prefix}\\name`];
      }
      if (rawMap[`${prefix}\\iconID`]) {
        ch.iconID = Number(rawMap[`${prefix}\\iconID`]);
        ch.iconEmoji = ICON_EMOJI_MAP[ch.iconID] || '🎚️';
      }
      for (let s = 0; s < 4; s++) {
        if (rawMap[`${prefix}\\volume_${s}`] !== undefined) {
          ch.volumes[s] = Number(rawMap[`${prefix}\\volume_${s}`]);
        }
        if (rawMap[`${prefix}\\mute_${s}`] !== undefined) {
          ch.mutes[s] = rawMap[`${prefix}\\mute_${s}`] === 'true';
        }
        if (rawMap[`${prefix}\\solo_${s}`] !== undefined) {
          ch.solos[s] = rawMap[`${prefix}\\solo_${s}`] === 'true';
        }
        if (rawMap[`${prefix}\\linked_${s}`] !== undefined) {
          ch.linked[s] = rawMap[`${prefix}\\linked_${s}`] === 'true';
        }
      }
    }
  });

  // Canal de Samples
  for (let s = 0; s < 4; s++) {
    const sv = rawMap[`samples_channel\\volume_${s}`];
    if (sv !== undefined) state.channels[8].volumes[s] = Number(sv);
  }

  return state;
}

/**
 * Exporta el estado actual al formato `.mackie` [V2] compatible con Mackie Matrix en Windows e iPadOS
 */
export function exportMackieConfigFile(state) {
  const lines = [`[${state.schemaVersion || 'V2'}]`];
  state.channels.slice(0, 8).forEach((ch) => {
    const enc = encodeURIComponent(ch.key).replace(/\(/g, '%28').replace(/\)/g, '%29');
    lines.push(`channels_current\\${enc}\\iconID=${ch.iconID}`);
    lines.push(`channels_current\\${enc}\\inputAudioDeviceName=${ch.inputAudioDeviceName}`);
    for (let s = 0; s < 4; s++) {
      lines.push(`channels_current\\${enc}\\linked_${s}=${ch.linked[s]}`);
      lines.push(`channels_current\\${enc}\\linked_delta_${s}=0`);
      lines.push(`channels_current\\${enc}\\mute_${s}=${ch.mutes[s]}`);
    }
    lines.push(`channels_current\\${enc}\\name=${ch.name}`);
    lines.push(`channels_current\\${enc}\\pathToCustomIcon=`);
    for (let s = 0; s < 4; s++) {
      lines.push(`channels_current\\${enc}\\solo_${s}=${ch.solos[s]}`);
    }
    for (let s = 0; s < 4; s++) {
      lines.push(`channels_current\\${enc}\\volume_${s}=${Math.round(ch.volumes[s])}`);
    }
  });

  state.submixes.forEach((sub, s) => {
    lines.push(`submixes\\${s}\\monitor=${sub.monitor}`);
    lines.push(`submixes\\${s}\\mute=${sub.mute}`);
    lines.push(`submixes\\${s}\\outputAudioDeviceName=${sub.outputAudioDeviceName}`);
    lines.push(`submixes\\${s}\\selected=${state.selectedSubmix === s}`);
    lines.push(`submixes\\${s}\\solo=${sub.solo}`);
    lines.push(`submixes\\${s}\\volume=${Math.round(sub.volume)}`);
  });

  return lines.join('\r\n') + '\r\n';
}
