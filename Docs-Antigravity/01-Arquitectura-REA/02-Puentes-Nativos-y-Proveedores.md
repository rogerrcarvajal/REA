# 🌉 Puentes Nativos (`bridge/`), Addon Windows (`native/`) y Proveedores de Análisis

> **Desarrollador Líder:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
> **Ubicación:** `Docs-Antigravity/01-Arquitectura-REA/02-Puentes-Nativos-y-Proveedores.md`  
> **Referencia de Código:** [`bridge/`](../../bridge), [`native/`](../../native), [`package.json`](../../package.json)

---

## 1. Arquitectura de Puentes (`bridge/`)

Para inspeccionar binarios, paquetes móviles y comportamiento en tiempo de ejecución sin acoplar los motores pesados al proceso Node.js principal, REA despliega puentes especializados en el lenguaje nativo de cada motor:

| Archivo / Directorio en `bridge/` | Lenguaje / Motor | Función Específica en REA |
| :--- | :--- | :--- |
| [`bridge/hopper_bridge.py`](../../bridge/hopper_bridge.py) | Python (Hopper Disassembler API) | Se ejecuta dentro de Hopper para exponer procedimientos, pseudocódigo, CFG, referencias cruzadas (`xrefs`) y cadenas mediante sockets locales. |
| [`bridge/ghidra/ReaGhidraBridge.java`](../../bridge/ghidra/ReaGhidraBridge.java) | Java (Ghidra HeadlessScript) | Puente principal para Ghidra sin GUI. Gestiona inventario de funciones, decompilador C, tipos, flujo de valores (`value_flow`) y tablas de salto ARM64/MIPS/RISC-V. |
| [`bridge/ghidra/ReaGhidraApplySeeds.java`](../../bridge/ghidra/ReaGhidraApplySeeds.java) y extensiones | Java (Ghidra) | Aplica semillas de puntos de entrada, soporte para DOS `.COM` (`ReaGhidraPrepareCom.java`), binarios crudos (`ReaGhidraPrepareRaw.java`) y correcciones `NoReturn`. |
| [`bridge/android/ReaJadxBridge.java`](../../bridge/android/ReaJadxBridge.java) | Java (JADX Headless) | Descompilación estática de paquetes Android (`.apk`), manifiestos, clases, métodos y grafo de referencias entrantes. |
| [`bridge/native/ReaNativeUI.swift`](../../bridge/native/ReaNativeUI.swift) y [`NativeUIChildren.swift`](../../bridge/native/NativeUIChildren.swift) | Swift (macOS Accessibility / Quartz) | Inspección y automatización de interfaces nativas macOS/Apple y jerarquías de ventanas. |
| [`bridge/native/rea_lldb_tracer.py`](../../bridge/native/rea_lldb_tracer.py) | Python (LLDB Debugger) | Trazado dinámico de llamadas a funciones nativas y selectores Objective-C/Swift en ejecutables Mach-O (`observe_native_calls`). |
| [`bridge/process/ProcessRunTokenReader.swift`](../../bridge/process/ProcessRunTokenReader.swift) | Swift | Verificación criptográfica de propiedad de procesos en sistemas Apple (Darwin). |
| [`bridge/cutter/rea_bridge.py`](../../bridge/cutter/rea_bridge.py) | Python (Cutter / Rizin) | Adaptador para el motor de ingeniería inversa Rizin/Cutter. |
| [`bridge/mitmproxy/capture.py`](../../bridge/mitmproxy/capture.py) | Python (`mitmdump`) | Extracción y normalización de capturas de tráfico HTTP/HTTPS/WebSockets. |
| [`bridge/pwntools/`](../../bridge/pwntools) y [`bridge/pwndbg/`](../../bridge/pwndbg) | Python (pwntools / GDB) | Diagnóstico offline de layout ELF, mitigaciones (RELRO, Canary, NX, PIE) y análisis post-mortem de volcados `core` (`recorded_crash.py`). |

---

## 2. Addon Nativo de Seguridad en Windows (`native/windows/`)

En entornos Windows (como la estación de trabajo actual sobre XAMPP/Windows 11), REA incluye un módulo nativo precompilado en C++/Node-API:

- **Ruta:** [`native/windows/build/rea-windows-x64.node`](../../native/windows/build/rea-windows-x64.node) y [`manifest.json`](../../native/windows/build/manifest.json).
- **Verificador:** [`scripts/verify-windows-native-artifact.mjs`](../../scripts/verify-windows-native-artifact.mjs).
- **Capacidades:**
  1. **Admisión NTFS y DACLs Protegidas:** Crea directorios de tiempo de ejecución privados (`WindowsPrivateRuntime.ts`) con listas de control de acceso (DACL) que impiden la lectura o manipulación por otros usuarios locales.
  2. **Asignación Atómica de Job Objects (`WindowsOwnedProcess.ts`):** Asegura que cualquier proceso lanzado por REA (como el worker de análisis JavaScript o Ghidra Headless en Windows) pertenezca a un Job Object de Windows que termina automáticamente todos los procesos hijos si el servidor MCP se cierra o cancela la operación.

---

## 3. Motores que No Requieren Instalación Externa (Zero-Engine Built-in)

Para facilitar el trabajo inmediato en Windows hacia el **iPad Pro M2**, REA cuenta con analizadores 100% integrados en TypeScript/Node.js que **no requieren instalar Ghidra, Hopper ni IDA**:

| Analizador Integrado (TypeScript puro) | Herramientas MCP Asociadas | Utilidad para Proyectos y Portabilidad iPad Pro M2 |
| :--- | :--- | :--- |
| **Reconstructor JavaScript / Electron / ASAR** | `analyze_javascript_application`, `trace_application_feature`, `recover_javascript_source`, `compare_application_versions` | Analiza cualquier app de escritorio (Notion, VS Code, Slack, apps locales) o bundle web para extraer su arquitectura completa y portarla a iPadOS. |
| **Inspector de Ecosistema Apple (Mach-O, IPA, Plist, Dyld, NIB)** | `inspect_artifact`, `project_apple_application_graph`, `inspect_macho`, `trace_dylib_resolution`, `inspect_plist`, `decode_interface_builder`, `inspect_asset_catalog`, `inspect_signature` | Analiza archivos `.ipa`, `.app`, `Info.plist`, arquitecturas `arm64`, enlaces dinámicos y recursos visuales **directamente desde Windows** sin necesitar una Mac. |
| **Inspector de Código Administrado (.NET / CIL)** | `inspect_managed_artifact`, `inspect_managed_members`, `project_managed_application_graph` | Extrae metadatos, clases, métodos e instrucciones CIL de ensamblados `.dll` y `.exe` sin ejecutarlos. |
| **Inspector de Bases de Datos SQLite** | `inspect_sqlite_database` | Extrae esquemas y muestras seguras de bases de datos SQLite de aplicaciones móviles o de escritorio. |
| **Inspector de Metadatos Go, Rust y Recursos PE** | `inspect_go_binary`, `inspect_rust_binary`, `inspect_pe_resources` | Identifica compiladores, dependencias (`cargo-auditable`, Go buildinfo) e iconos/recursos estáticos. |
