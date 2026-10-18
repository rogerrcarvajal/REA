# 🎛️ Documentación Viva: Mackie Matrix Console M2 (iPad Pro M2)

**Autor:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
**Plataforma Objetivo:** iPad Pro M2 (iPadOS 17+ / Apple Silicon ARM64)  
**Motor de Ingeniería Inversa:** REA (Reverse Engineer Anything v6.5.0)  
**Ruta de Aplicación:** `C:\xampp\htdocs\REA\Mackie-Matrix-App\`

---

## 🧭 Índice de Documentación Viva (`Mackie-Matrix-App/Docs/`)

| Documento | Descripción | Estado |
| :--- | :--- | :---: |
| [01-Ingenieria-Inversa-REA-Mackie-Matrix.md](./01-Ingenieria-Inversa-REA-Mackie-Matrix.md) | Evidencia PE32+ x86_64 (`ev_78d3359d81c24faf54d45ebacfb1498f0616e46ac2e3615bff7ffedbe85918fd`), dependencias Qt6, drivers virtuales `tlsetupfx` y arquitectura de `Mackie Matrix.exe`. | ✅ Completo |
| [02-Especificacion-Formato-Config-Mackie.md](./02-Especificacion-Formato-Config-Mackie.md) | Especificación técnica completa de los esquemas `[V1]` y `[V2]` de los archivos `.mackie` (`channels_current`, `submixes`, `eq_presets`, `mvoice_state`, `sample_settings`, `vfx_presets_current`). | ✅ Completo |
| [03-Arquitectura-DSP-y-Manual-iPad-Pro-M2.md](./03-Arquitectura-DSP-y-Manual-iPad-Pro-M2.md) | Arquitectura del motor DSP WebAudio a 48kHz (`MackieMatrixDSPEngine`) y guía de instalación en el iPad Pro M2. | ✅ Completo |

---

## 🏗️ Estructura del Proyecto `Mackie-Matrix-App`

```text
Mackie-Matrix-App/
├── index.html                  # Consola Digital 9x4, Editor EQ 5 Bandas y Sampler de 32 Pads
├── manifest.webmanifest        # Manifiesto PWA Standalone (Landscape) para iPad Pro M2
├── sw.js                       # Service Worker Offline-First
├── capacitor.config.json       # Configuración lista para empaquetado nativo Xcode (.ipa)
├── presets/
│   ├── MainStream-Config-Backup-V2.mackie  # Backup real [V2] del usuario pre-cargado
│   └── Mackie-Mainstream-Backup-V1.mackie  # Backup real [V1] del usuario
├── css/
│   └── styles.css              # Diseño Glassmorphic Quantum Dark + Mackie Green
├── js/
│   ├── mackie-parser.js        # Parser/Exportador nativo de archivos .mackie ([V1] y [V2])
│   ├── dsp-engine.js           # Motor WebAudio 48kHz (5-Band Biquad EQ, Compresor MVoice, 32 Pads)
│   └── app.js                  # Controlador de la matriz 9x4, enlace de faders (Link) y curvas EQ
└── Docs/                       # Documentación viva de ingeniería inversa y desarrollo
```
