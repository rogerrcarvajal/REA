# 📹 Documentación Viva: Mackie MainStream Studio M2 (iPad Pro M2)

**Autor:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
**Plataforma Objetivo:** iPad Pro M2 (iPadOS 17+ / Apple Silicon ARM64)  
**Motor de Ingeniería Inversa:** REA (Reverse Engineer Anything v6.5.0)  
**Ruta de Aplicación:** `C:\xampp\htdocs\REA\Mackie-MainStream-App\`

---

## 🧭 Índice de Documentación Viva (`Mackie-MainStream-App/Docs/`)

| Documento | Descripción | Estado |
| :--- | :--- | :---: |
| [01-Ingenieria-Inversa-REA-MainStream.md](./01-Ingenieria-Inversa-REA-MainStream.md) | Evidencia recolectada con REA sobre el hardware Mackie MainStream, sus endpoints USB-C (UVC + UAC2 + HID) y su integración con Mackie Matrix. | ✅ Completo |
| [02-Solucion-Fallo-Video-UVC-iPad-Pro-M2.md](./02-Solucion-Fallo-Video-UVC-iPad-Pro-M2.md) | Diagnóstico de causa raíz de los fallos de video HDMI al conectar el Mackie MainStream al iPad Pro M2 y arquitectura del motor `MackieMainStreamUVCEngine`. | ✅ Completo |
| [03-Arquitectura-y-Manual-Instalacion-iPadOS.md](./03-Arquitectura-y-Manual-Instalacion-iPadOS.md) | Guía paso a paso para instalar y ejecutar la aplicación como PWA Standalone o paquete nativo `.ipa` (Capacitor iOS) en el iPad Pro M2. | ✅ Completo |

---

## 🏗️ Estructura del Proyecto `Mackie-MainStream-App`

```text
Mackie-MainStream-App/
├── index.html                  # Interfaz principal Glassmorphic (Monitor HDMI, Scopes 120Hz, Superficie Física)
├── manifest.webmanifest        # Manifiesto PWA Standalone para iPadOS 17+
├── sw.js                       # Service Worker Offline-First con caché determinista
├── capacitor.config.json       # Configuración lista para empaquetado nativo Xcode (.ipa)
├── css/
│   └── styles.css              # Diseño Quantum Dark + Mackie Green (Stage Manager & Apple Pencil 2 Hover)
├── js/
│   ├── uvc-engine.js           # Motor de negociación UVC en cascada, reloj UAC2 48kHz y Watchdog Anti-Drop
│   └── app.js                  # Controlador de UI, Scopes 120Hz (Waveform, Histograma, VU) y Grabador MP4
├── assets/                     # Fotografías e iconos oficiales extraídos de D:\Installers\Mackie Mainstream
└── Docs/                       # Documentación viva del proyecto Mackie MainStream Studio M2
```
