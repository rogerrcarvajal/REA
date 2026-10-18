# 🔬 01. Ingeniería Inversa con REA: Software `Mackie Matrix.exe`

**Autor:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
**Binario Analizado:** `C:\Program Files\Mackie Matrix\Mackie Matrix.exe`  
**ID de Evidencia REA:** `ev_78d3359d81c24faf54d45ebacfb1498f0616e46ac2e3615bff7ffedbe85918fd`

---

## 1. Evidencia Forense del Binario Principal (`inspect_pe_resources`)

Mediante el servidor MCP de **REA (`inspect_pe_resources`)** se inspeccionó el binario instalado en `C:\Program Files\Mackie Matrix\Mackie Matrix.exe`, obteniendo las siguientes pruebas verificables (`Observed`):

| Propiedad | Valor Observado (REA) |
| :--- | :--- |
| **Ruta del Binario** | `C:\Program Files\Mackie Matrix\Mackie Matrix.exe` |
| **Formato de Imagen** | `PE32+` (64-bit Windows Executable `x86_64`) |
| **Tamaño Exacto** | `54,842,744 bytes` (~52.3 MB) |
| **Digest SHA-256** | `0641d342bbd949fbaaa7da882751fa177a71ccd7ad83ecbd73eff58860657a95` |
| **Recursos PE Totales** | `14 entradas` (`12 RT_ICON`, `1 RT_GROUP_ICON` como `IDI_ICON1`, `1 RT_MANIFEST` XML UTF-8 de `926 bytes`) |
| **Framework de UI & Audio** | **Qt6 C++** (`Qt6Core.dll`, `Qt6Gui.dll`, `Qt6Multimedia.dll`, `Qt6Network.dll`, `Qt6OpenGL.dll`, `Qt6Svg.dll`, `Qt6Widgets.dll`) |
| **Backends Multimedia** | `multimedia\ffmpegmediaplugin.dll` y `multimedia\windowsmediaplugin.dll` |
| **Instalador de Drivers Virtuales** | `drivercmd.bat` -> `DriverSetup\x64\tlsetupfx.exe task DoInstall --cfg tlsetupfx_main.xml` (Thesycon/TUSBAudio SetupFX v3.6 para Windows 10 1507+ x64) |

---

## 2. Arquitectura Interna Descubierta en `Mackie Matrix`

1. **Subsistema de Drivers WDM/WASAPI Virtuales (`DriverSetup\x64\tlsetupfx_main.xml`)**:
   - El instalador registra en el kernel de Windows **5 dispositivos de entrada virtual**:
     - `Virtual input A` (asignado por defecto a **Game**)
     - `Virtual input B` (asignado por defecto a **Chat**)
     - `Virtual input C` (asignado por defecto a **Music**)
     - `Virtual input D` (asignado por defecto a **Browser**)
     - `Virtual input E` (asignado por defecto a **System**)
   - Y registra **4 buses de mezcla de salida (`submixes\0..3`)**:
     - `Submix 0`: Salida de hardware principal (`Audio Output (2- MainStream)` o `Stream Mix - Mackie Matrix`)
     - `Submix 1`: `Monitor Mix - Mackie Matrix`
     - `Submix 2`: `Virtual Mix 1 - Mackie Matrix`
     - `Submix 3`: `Virtual Mix 2 - Mackie Matrix`
2. **Motor VST3 Embebido (`mvoice_state`)**:
   - Cada canal de entrada soporta una instancia de plugin `<VST3PluginState><IComponent>` serializada en Base64/Binario bajo el prefijo `VC2!`, encargada del procesamiento vocal **MVoice** (Noise Gate, Compresor, Limitador).
3. **Recursos de Audio Internos Qt (`:/resources/sounds/`)**:
   - El ejecutable de 54.8 MB empaqueta en su sección `.rdata` / Qt Resource System los wavs originales del Banco A (`airhorn.wav`, `scream.wav`, `applause.wav`, `laughter.wav`, `trombone.wav`, `crickets.wav`, `mackie_theme.wav`, `bleep_1k.wav`).
