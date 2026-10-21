/**
 * @file mackie-parser.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Parser y Serializador nativo para archivos `.mackie` ([V1] y [V2])
 *              con mapeo directo a los 78 archivos MP3 reales de `D:/OBS/Efectos de Sonido/` copiados en `./sounds/`.
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
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [false, false, false, false],
      eqPreset: 'Eq Main Stream',
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
      mutes: [false, false, false, false],
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
      volumes: [85, 85, 85, 85],
      mutes: [false, false, false, false],
      solos: [false, false, false, false],
      linked: [true, true, true, true],
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
      { id: 'A1', name: 'Airhorn', color: '#9ccc56', synth: 'airhorn', hotkey: 'F1', audioUrl: './sounds/goofy-ahh-car-horn-sound-effect.mp3', filePath: ':/resources/sounds/airhorn.wav' },
      { id: 'A2', name: 'Scream', color: '#4eb96c', synth: 'scream', hotkey: 'F2', audioUrl: './sounds/HELP ME!.mp3', filePath: ':/resources/sounds/scream.wav' },
      { id: 'A3', name: 'Applause', color: '#85cca9', synth: 'applause', hotkey: 'F3', audioUrl: './sounds/levantense-saturado.mp3', filePath: ':/resources/sounds/applause.wav' },
      { id: 'A4', name: 'Laughter', color: '#64cbe5', synth: 'laughter', hotkey: 'F4', audioUrl: './sounds/risada-mp3cut.mp3', filePath: ':/resources/sounds/laughter.wav' },
      { id: 'A5', name: 'Sad Trombone', color: '#a276b3', synth: 'trombone', hotkey: 'F5', audioUrl: './sounds/wah-wah-sound-effect.mp3', filePath: ':/resources/sounds/trombone.wav' },
      { id: 'A6', name: 'Crickets / Mosquito', color: '#ee3524', synth: 'crickets', hotkey: 'F6', audioUrl: './sounds/mosquito.mp3', filePath: ':/resources/sounds/crickets.wav' },
      { id: 'A7', name: 'After Dark', color: '#ffc909', synth: 'chord', hotkey: 'F7', audioUrl: './sounds/george-micael-wham-careless-whisper-1.mp3', filePath: ':/resources/sounds/mackie_theme.wav' },
      { id: 'A8', name: 'BLEEP 1kHz', color: '#ee3524', synth: 'bleep', hotkey: 'F8', audioUrl: '', filePath: ':/resources/sounds/bleep_1k.wav' }
    ],
    B: [
      { id: 'B1', name: 'Directed by Robert', color: '#9ccc56', synth: 'chord', hotkey: 'F9', audioUrl: './sounds/well-be-right-back-green-screen_8oEb98L.mp3', filePath: 'D:/OBS/Efectos de Sonido/directed-by-robert.mp3' },
      { id: 'B2', name: 'Cell sintio terror', color: '#4eb96c', synth: 'subdrop', hotkey: 'F10', audioUrl: './sounds/en-ese-momento-cell-sintio-el-verdadero-terror-v-descarga.mp3', filePath: 'D:/OBS/Efectos de Sonido/en-ese-momento-cell-sintio-el-verdadero-terror-v-descarga.mp3' },
      { id: 'B3', name: 'Alguien con vida', color: '#85cca9', synth: 'sonar', hotkey: 'F11', audioUrl: './sounds/hay-alguien-ahi-con-vida-larga.mp3', filePath: 'D:/OBS/Efectos de Sonido/hay-alguien-ahi-con-vida-larga.mp3' },
      { id: 'B4', name: 'Como estan (Dross)', color: '#9ccc56', synth: 'stinger', hotkey: 'F12', audioUrl: './sounds/hola-cono-de-sus-madres-dross.mp3', filePath: 'D:/OBS/Efectos de Sonido/hola-cono-de-sus-madres-dross.mp3' },
      { id: 'B5', name: 'La vida es un carrusel', color: '#a276b3', synth: 'arp', hotkey: 'PAD5', audioUrl: './sounds/la-vida-es-un-carrusel.mp3', filePath: 'D:/OBS/Efectos de Sonido/la-vida-es-un-carrusel.mp3' },
      { id: 'B6', name: 'Sala de espera', color: '#ee3524', synth: 'lofi', hotkey: 'PAD6', audioUrl: './sounds/o-sonidos-de-espera.mp3', filePath: 'D:/OBS/Efectos de Sonido/o-sonidos-de-espera.mp3' },
      { id: 'B7', name: 'Patria y mas Patria', color: '#f6ec3b', synth: 'brass', hotkey: 'PAD7', audioUrl: './sounds/patria.mp3', filePath: 'D:/OBS/Efectos de Sonido/patria.mp3' },
      { id: 'B8', name: 'Apareciste (Picoro)', color: '#ee3524', synth: 'impact', hotkey: 'PAD8', audioUrl: './sounds/por-fin-apareciste-malnacido-picoro.mp3', filePath: 'D:/OBS/Efectos de Sonido/por-fin-apareciste-malnacido-picoro.mp3' }
    ],
    C: [
      { id: 'C1', name: 'Estoy cansado jefe', color: '#64cbe5', synth: 'chord', hotkey: 'C1', audioUrl: './sounds/estoy-cansado-jefe.mp3', filePath: 'D:/OBS/Efectos de Sonido/estoy-cansado-jefe.mp3' },
      { id: 'C2', name: 'Billie Jean', color: '#ffc909', synth: 'chord', hotkey: 'C2', audioUrl: './sounds/michael-jackson-billie-jean.mp3', filePath: 'D:/OBS/Efectos de Sonido/michael-jackson-billie-jean.mp3' },
      { id: 'C3', name: 'Pink Panther', color: '#ea1a5b', synth: 'chord', hotkey: 'C3', audioUrl: './sounds/the-pink-panther-theme-song-original-version.mp3', filePath: 'D:/OBS/Efectos de Sonido/the-pink-panther-theme-song-original-version.mp3' },
      { id: 'C4', name: 'Ser Millonario', color: '#a276b3', synth: 'chord', hotkey: 'C4', audioUrl: './sounds/quien-quiere-ser-millonario_ScfDHTc.mp3', filePath: 'D:/OBS/Efectos de Sonido/quien-quiere-ser-millonario_ScfDHTc.mp3' },
      { id: 'C5', name: 'Y se marchó', color: '#9ccc56', synth: 'chord', hotkey: 'C5', audioUrl: './sounds/y-se-marcho.mp3', filePath: 'D:/OBS/Efectos de Sonido/y-se-marcho.mp3' },
      { id: 'C6', name: 'Hello Darkness', color: '#64cbe5', synth: 'chord', hotkey: 'C6', audioUrl: './sounds/hellodarknessmyoldfriend.mp3', filePath: 'D:/OBS/Efectos de Sonido/hellodarknessmyoldfriend.mp3' },
      { id: 'C7', name: 'Qué difícil me la pusiste', color: '#f0582a', synth: 'chord', hotkey: 'C7', audioUrl: './sounds/que-dificil-me-la-pusiste.mp3', filePath: 'D:/OBS/Efectos de Sonido/que-dificil-me-la-pusiste.mp3' },
      { id: 'C8', name: 'No hay plata', color: '#ee3524', synth: 'chord', hotkey: 'C8', audioUrl: './sounds/no-hay-plata.mp3', filePath: 'D:/OBS/Efectos de Sonido/no-hay-plata.mp3' }
    ],
    D: [
      { id: 'D1', name: 'Mii Channel Music', color: '#9ccc56', synth: 'chord', hotkey: 'D1', audioUrl: './sounds/mii-channel-music.mp3', filePath: 'D:/OBS/Efectos de Sonido/mii-channel-music.mp3' },
      { id: 'D2', name: 'Free Bird Solo', color: '#4eb96c', synth: 'chord', hotkey: 'D2', audioUrl: './sounds/free-bird-solo.mp3', filePath: 'D:/OBS/Efectos de Sonido/free-bird-solo.mp3' },
      { id: 'D3', name: 'Harry Potter Fail', color: '#85cca9', synth: 'chord', hotkey: 'D3', audioUrl: './sounds/harry-potter-themesong-fail-recorder-cover-1.mp3', filePath: 'D:/OBS/Efectos de Sonido/harry-potter-themesong-fail-recorder-cover-1.mp3' },
      { id: 'D4', name: 'Hector El Father', color: '#ffc909', synth: 'chord', hotkey: 'D4', audioUrl: './sounds/hector-el-father.mp3', filePath: 'D:/OBS/Efectos de Sonido/hector-el-father.mp3' },
      { id: 'D5', name: 'Identifícate', color: '#a276b3', synth: 'chord', hotkey: 'D5', audioUrl: './sounds/identificate.mp3', filePath: 'D:/OBS/Efectos de Sonido/identificate.mp3' },
      { id: 'D6', name: 'Mario Meme', color: '#ee3524', synth: 'chord', hotkey: 'D6', audioUrl: './sounds/mario-meme.mp3', filePath: 'D:/OBS/Efectos de Sonido/mario-meme.mp3' },
      { id: 'D7', name: 'Sonido de Puerta', color: '#64cbe5', synth: 'chord', hotkey: 'D7', audioUrl: './sounds/sonido-de-puerta.mp3', filePath: 'D:/OBS/Efectos de Sonido/sonido-de-puerta.mp3' },
      { id: 'D8', name: 'No creo risa', color: '#f0582a', synth: 'chord', hotkey: 'D8', audioUrl: './sounds/no-creoo-risa.mp3', filePath: 'D:/OBS/Efectos de Sonido/no-creoo-risa.mp3' }
    ]
  },
  vfx: {
    noiseGateOn: true,
    compressorOn: true,
    reverbOn: false,
    delayOn: false,
    telephoneOn: false,
    pitchRobotOn: false
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

  for (let s = 0; s < 4; s++) {
    const sv = rawMap[`samples_channel\\volume_${s}`];
    if (sv !== undefined) state.channels[8].volumes[s] = Number(sv);
  }

  return state;
}

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
