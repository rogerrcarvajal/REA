# 📱 03. Arquitectura y Manual de Instalación en iPad Pro M2 (iPadOS 17+)

**Autor:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))

---

## 1. Requisitos de Conexión Física en el iPad Pro M2

> [!IMPORTANT]
> **Recomendación de Alimentación USB-C (Power Delivery):**  
> Dado que el Mackie MainStream alimenta su escalador HDMI 4K60, su preamplificador XLR de +60 dB y su hub de 2 puertos USB-A desde el puerto USB-C, al conectarlo al **iPad Pro M2** se recomienda utilizar un **Hub USB-C / Thunderbolt con carga pasante (USB-PD)** o conectar el cable USB-C directamente al puerto Thunderbolt del iPad Pro M2 con batería superior al 35%.

---

## 2. Opción A: Instalación Directa como App PWA Standalone desde XAMPP (Sin Cables de Compilación)

1. Asegúrate de que el servidor **Apache de XAMPP** esté activo en tu PC (`c:\xampp\htdocs\REA\Mackie-MainStream-App`).
2. Conecta tu **iPad Pro M2** a la misma red Wi-Fi local (o mediante USB Ethernet compartido).
3. En Safari del iPad Pro M2, abre:
   - `http://localhost/REA/Mackie-MainStream-App/` (en local) o `http://<IP-DE-TU-PC>/REA/Mackie-MainStream-App/`
   - *(Nota: Para que WebKit habilite `navigator.mediaDevices.getUserMedia` fuera de `localhost`, puedes usar el túnel HTTPS local o empaquetar con Capacitor en la Opción B).*
4. Toca el botón **Compartir** en la barra superior de Safari y selecciona **"Añadir a la pantalla de inicio"** (*Add to Home Screen*).
5. La aplicación se instalará con el icono oficial de **MainStream M2** y se ejecutará a pantalla completa (`display: standalone`), ocultando la interfaz de Safari y soportando **Stage Manager** y **Picture-in-Picture (PiP)**.

---

## 3. Opción B: Compilación e Instalación como App Nativa `.ipa` (Capacitor iOS)

El proyecto ya incluye [`capacitor.config.json`](../capacitor.config.json) configurado con `appId: "com.rogerrcarvajal.rea.mackiemainstream"`. Para instalarla como binario nativo `.ipa`:

```bash
cd Mackie-MainStream-App
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```

En `Info.plist` dentro de Xcode, asegúrate de incluir los permisos de captura UVC/UAC2 para iPadOS 17+:
```xml
<key>NSCameraUsageDescription</key>
<string>Mackie MainStream Studio requiere acceso UVC para mostrar y grabar la entrada de video HDMI en el iPad Pro M2.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Mackie MainStream Studio requiere acceso UAC2 a 48kHz para procesar el audio del Mackie MainStream.</string>
```
