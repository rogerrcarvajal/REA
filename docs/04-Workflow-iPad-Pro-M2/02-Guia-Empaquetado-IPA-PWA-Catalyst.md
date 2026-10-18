# 📦 Guía Práctica de Empaquetado e Instalación en iPad Pro M2 (IPA, Capacitor, Catalyst y PWA Standalone)

> **Desarrollador Líder:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
> **Ubicación:** `Docs/04-Workflow-iPad-Pro-M2/02-Guia-Empaquetado-IPA-PWA-Catalyst.md`  
> **Propósito:** Plantillas listas para producción que permiten instalar y ejecutar sin problemas en el **iPad Pro M2** cualquier aplicación reconstruida o adecuada mediante REA.

---

## 1. Matriz de Decisión: ¿Cómo Instalar la Aplicación Adecuada en el iPad Pro M2?

Cuando trabajas desde un entorno Windows + XAMPP + Antigravity y tu dispositivo de ejecución es un **iPad Pro M2**, dispones de **3 rutas de instalación reales**:

| Ruta de Empaquetado | ¿Se puede generar desde Windows? | Experiencia en iPad Pro M2 | Caducidad de Firma | Caso de Uso Ideal |
| :--- | :--- | :--- | :--- | :--- |
| **1. PWA Standalone Nativa (iPadOS 16.4+ / 17+ / 18+)** | ✅ **Sí (100% desde Windows/XAMPP o Cloud)** | Icono propio en Home Screen/Dock, pantalla completa sin barra de Safari, Stage Manager completo, notificaciones Push, almacenamiento persistente offline y 120Hz. | **Nunca caduca** (Permanente) | Apps de escritorio Electron/JS, SaaS, dashboards, herramientas con IA, ERPs y utilidades portadas con WASM. |
| **2. Empaquetado `.IPA` Híbrido / Nativo (Capacitor + GitHub Actions macOS Runner)** | ✅ **Sí (Código en Windows + Compilación `.ipa` en GitHub Actions `macos-15` ARM64)** | Acceso a Bluetooth BLE, sistema de archivos nativo de iPadOS, biometría Face ID y aceleración Metal M2. | 7 días (Apple ID gratuito vía Sideloadly/AltStore) o 1 año (Apple Developer / Certificados). | Apps que requieren plugins nativos profundos de iPadOS o portabilidad de apps de escritorio/Android. |
| **3. Parcheo de `.IPA` Existente (Adecuación de `Info.plist` + Re-sign)** | ✅ **Sí (Extracción con REA + Sideloadly en Windows)** | Desbloquea resolución nativa Liquid Retina del iPad Pro M2, orientación horizontal y Stage Manager en apps que estaban limitadas a iPhone. | 7 días (con auto-refresh Wi-Fi en SideStore/AltStore) o 1 año. | Apps `.ipa` existentes que se ven recortadas o bloqueadas en modo vertical en el iPad Pro M2. |

---

## 2. Plantilla Completa para Vía 1: PWA Standalone Optimizada para iPad Pro M2

Para que una aplicación reconstruida con REA se instale como aplicación de primera clase en el **iPad Pro M2** desde Safari (**Compartir → Agregar a pantalla de inicio**), utiliza la siguiente arquitectura base:

### A. Cabecera HTML (`index.html`) con Soporte iPadOS y Viewport Notch/Safe-Area
```html
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <!-- Viewport optimizado para iPad Pro M2 11" y 12.9" con Stage Manager -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />

  <!-- Capacidades de App Instalable en iPadOS (Standalone Mode) -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="REA App M2" />
  <meta name="theme-color" content="#0f172a" />

  <!-- Iconos de Alta Densidad para iPad Pro (167x167px @2x para 12.9" y 152x152px) -->
  <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="167x167" href="/assets/icons/icon-167x167.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180x180.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <title>Aplicación Adecuada para iPad Pro M2</title>
</head>
```

### B. Manifiesto Web (`manifest.webmanifest`) Compatible con Stage Manager
```json
{
  "name": "Aplicación Portada con REA para iPad Pro M2",
  "short_name": "REA iPad M2",
  "description": "Aplicación reconstruida mediante ingeniería inversa REA y optimizada para iPad Pro M2",
  "start_url": "/?source=ipad-pwa",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "orientation": "any",
  "background_color": "#090d16",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/assets/icons/icon-167x167.png", "sizes": "167x167", "type": "image/png" },
    { "src": "/assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icons/icon-1024x1024.png", "sizes": "1024x1024", "type": "image/png" }
  ]
}
```

### C. Tokens CSS Glassmorphic y Soporte para Apple Pencil 2 Hover + Safe Areas
```css
:root {
  --safe-top: env(safe-area-inset-top, 24px);
  --safe-bottom: env(safe-area-inset-bottom, 20px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --bg-quantum: #090d16;
  --card-glass: rgba(15, 23, 42, 0.76);
  --border-glass: rgba(56, 189, 248, 0.22);
  --accent-cyan: #38bdf8;
  --accent-indigo: #6366f1;
}

body {
  background-color: var(--bg-quantum);
  color: #f8fafc;
  padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Soporte para Apple Pencil 2 Hover (12mm sobre pantalla M2) y Trackpad Magic Keyboard */
@media (hover: hover) and (pointer: fine) {
  .interactive-target:hover {
    transform: translateY(-2px) scale(1.01);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.28);
    transition: all 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}

/* Garantía de objetivos táctiles de 44x44pt según Apple Human Interface Guidelines */
.interactive-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## 3. Plantilla para Vía 2: Compilación Automática de `.IPA` desde Windows usando GitHub MCP + GitHub Actions (`macos-15`)

Dado que tu estación de desarrollo corre sobre Windows, puedes generar el archivo `.ipa` nativo (`arm64`) para tu **iPad Pro M2** sin necesitar una Mac física usando un workflow de GitHub Actions en tu repositorio `rogerrcarvajal/REA` (o en el repositorio de la app reconstruida):

1. **Estructura con Capacitor 6:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init "NombreApp" "com.rogerrcarvajal.app" --web-dir dist
   npx cap add ios
   ```
2. **Parámetros clave en `ios/App/App/Info.plist` para iPad Pro M2:**
   ```xml
   <key>UIDeviceFamily</key>
   <array>
     <integer>1</integer>
     <integer>2</integer>
   </array>
   <key>UIRequiresFullScreen</key>
   <false/>
   <key>UISupportsDocumentBrowser</key>
   <true/>
   <key>CADisableMinimumFrameDurationOnPhone</key>
   <true/>
   <key>UISupportedInterfaceOrientations~ipad</key>
   <array>
     <string>UIInterfaceOrientationPortrait</string>
     <string>UIInterfaceOrientationPortraitUpsideDown</string>
     <string>UIInterfaceOrientationLandscapeLeft</string>
     <string>UIInterfaceOrientationLandscapeRight</string>
   </array>
   ```
3. **Instalación en el iPad Pro M2 desde Windows:**
   - Descarga el artefacto `App-iPadPro-M2.ipa` compilado o parcheado.
   - Conecta el iPad Pro M2 por USB-C o Wi-Fi en la misma red local y cárgaselo mediante **Sideloadly** o **AltServer / SideStore** en Windows, quedando instalado directamente como aplicación nativa en iPadOS.
