# 🗺️ Mapa General de Archivos Generados y Estructura del Proyecto REA

> **Desarrollador Líder:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
> **Ubicación:** `Docs-Antigravity/00-Indice-General/01-Mapa-de-Archivos-Generados.md`  
> **Propósito:** Relacionar cada directorio y archivo generado en el repositorio con su función arquitectónica y su contraparte en la documentación viva.

---

## 1. Estructura de Nivel Superior del Proyecto (`REA`)

```text
REA/
├── .agents/                          # [Adecuación Antigravity] Reglas, Agentes, Skills y MCP
│   ├── SKILLS.md                     # Índice maestro de las 10 habilidades autónomas del proyecto
│   ├── mcp_config.json               # Configuración unificada de servidores MCP (github + rea)
│   ├── agents/
│   │   └── agents_registry.json      # 5 Roles multi-agente especializados (incluye iPad Pro M2)
│   ├── rules/                        # 7 Reglas jerárquicas (00 a 60, incluyendo regla REA + iPad M2)
│   └── skills/                       # 10 Habilidades autónomas (5 REA + 4 Globales + 1 iPad Pro M2)
├── .gemini/                          # [Espejo Dual Antigravity] Sincronizado con .agents/
├── Docs/                             # [Documentación Viva en Español] Estructurada en 6 subcarpetas
│   ├── 00-Indice-General/
│   ├── 01-Arquitectura-REA/
│   ├── 02-Adecuacion-Antigravity/
│   ├── 03-Catalogo-MCP-y-Herramientas/
│   ├── 04-Workflow-iPad-Pro-M2/
│   └── 05-Bitacora-Implementacion/
├── src/                              # [Motor Core REA en TypeScript] 43 módulos de dominio y proveedores
├── bridge/                           # [Puentes Nativos] Scripts Python, Java y Swift para motores externos
├── native/                           # [Addon Nativo Windows] Job Objects, NTFS DACLs (rea-windows-x64.node)
├── scripts/                          # [CLI & Automatización] Despachador rea.mjs, verificadores y generadores
├── docs/                             # [Documentación Original Upstream en Inglés/Multilenguaje]
├── tests/                            # [Suite de Pruebas Vitest] Pruebas unitarias, boundary, MCP y aceptación
├── third_party/                      # [Dependencias Auditadas] pwntools, pwndbg, wabt, evmole
└── website/                          # [Sitio Web Oficial REA] Recursos y diagramas SVG de flujo
```

---

## 2. Tabla de Correlación: Archivos Generados vs. Subcarpetas de `Docs/`

| Directorio / Archivo en el Proyecto | Naturaleza | Subcarpeta de `Docs/` que lo Documenta |
| :--- | :--- | :--- |
| `src/domain/`, `src/contracts/`, `src/application/`, `src/composition/`, `src/server/`, `src/cli/` | Núcleo Hexagonal de REA (TypeScript) | [`Docs-Antigravity/01-Arquitectura-REA/01-Arquitectura-Hexagonal-y-Dominios.md`](../01-Arquitectura-REA/01-Arquitectura-Hexagonal-y-Dominios.md) |
| `bridge/hopper_bridge.py`, `bridge/ghidra/*.java`, `bridge/android/ReaJadxBridge.java`, `bridge/native/*.swift`, `native/windows/` | Puentes de análisis profundo y supervisión de procesos | [`Docs-Antigravity/01-Arquitectura-REA/02-Puentes-Nativos-y-Proveedores.md`](../01-Arquitectura-REA/02-Puentes-Nativos-y-Proveedores.md) |
| `.agents/SKILLS.md`, `.agents/skills/*`, `.agents/rules/*`, `.agents/agents/agents_registry.json`, `.gemini/*` | Personalización de Google Antigravity en 3 niveles | [`Docs-Antigravity/02-Adecuacion-Antigravity/01-Configuracion-Agents-y-Skills.md`](../02-Adecuacion-Antigravity/01-Configuracion-Agents-y-Skills.md) |
| `.agents/mcp_config.json`, `~/.gemini/config/mcp_config.json`, `.git/config` | Integración de servidores MCP (`github` y `rea`) y remotos Git | [`Docs-Antigravity/02-Adecuacion-Antigravity/02-Sincronizacion-GitHub-MCP.md`](../02-Adecuacion-Antigravity/02-Sincronizacion-GitHub-MCP.md) |
| `src/server/register*Tools.ts`, `server.json`, `docs/mcp-contracts.md` | Catálogo de más de 170 herramientas MCP y contrato `Evidence` | [`Docs-Antigravity/03-Catalogo-MCP-y-Herramientas/01-Contratos-MCP-y-Flujo-Evidencia.md`](../03-Catalogo-MCP-y-Herramientas/01-Contratos-MCP-y-Flujo-Evidencia.md) |
| `.agents/skills/rea-ipad-pro-m2-porter/SKILL.md`, `.agents/rules/60-rea-reverse-engineering-and-ipad-m2.md` | Flujo de ingeniería inversa y portabilidad a iPad Pro M2 | [`Docs-Antigravity/04-Workflow-iPad-Pro-M2/01-Pipeline-Ingenieria-Inversa-iPad-Pro-M2.md`](../04-Workflow-iPad-Pro-M2/01-Pipeline-Ingenieria-Inversa-iPad-Pro-M2.md) y [`02-Guia-Empaquetado-IPA-PWA-Catalyst.md`](../04-Workflow-iPad-Pro-M2/02-Guia-Empaquetado-IPA-PWA-Catalyst.md) |
| `Docs-Antigravity/05-Bitacora-Implementacion/` | Trazabilidad histórica y respaldos de reglas | [`Docs-Antigravity/05-Bitacora-Implementacion/01-Walkthrough-Adecuacion-Viva.md`](../05-Bitacora-Implementacion/01-Walkthrough-Adecuacion-Viva.md) |

---

## 3. Inventario de los 43 Módulos de `src/` en REA

El directorio `src/` del motor REA está organizado por dominios y adaptadores de proveedores:

1. **Adaptadores de Entrada y Composición (`src/main/`, `src/cli/`, `src/server/`, `src/composition/`, `src/config/`)**:
   - `src/main.ts` y `src/main/`: Servidor MCP stdio y ciclo de vida de sesión.
   - `src/cli.ts` y `src/cli/`: Adaptador CLI (`rea setup`, `rea doctor`, `rea analyze-*`).
   - `src/server/`: Traducción de peticiones MCP y registro modular de herramientas (`registerNativeTools.ts`, `registerApplicationTools/`, `registerBrowserTools.ts`, etc.).
   - `src/composition/`: Fábricas tipadas e inyección de dependencias sin estado global compartido.
2. **Núcleo de Dominio y Contratos (`src/domain/`, `src/contracts/`, `src/application/`)**:
   - `src/domain/`: Módulos puros libres de efectos secundarios (grafos de aplicación, comparaciones, modelo de `Evidence` e incógnitas `Unknown`).
   - `src/contracts/`: Esquemas JSON Schema y Zod visibles para el cliente MCP y la CLI.
   - `src/application/`: Casos de uso compartidos entre CLI y MCP (`BinarySession`, `SessionProviderRouter`, `EvidenceLedger`, reconstrucción JavaScript).
3. **Proveedores de Análisis Nativo y Binario (`src/hopper/`, `src/ghidra/`, `src/ida/`, `src/kuna/`, `src/cutter/`, `src/rizin/`, `src/gdb/`, `src/objdump/`, `src/native/`, `src/go/`, `src/rust/`, `src/wasm/`, `src/evm/`)**:
   - Motores de decompilación profunda y análisis estático/dinámico para binarios Mach-O (macOS/iOS/iPadOS), PE (Windows), ELF (Linux), WebAssembly y EVM.
4. **Proveedores de Aplicaciones, Móviles y Web (`src/javascript/`, `src/electron/`, `src/browser/`, `src/inspector/`, `src/android/`, `src/adb/`, `src/apktool/`, `src/jeb/`, `src/flutter/`, `src/dotnet/`, `src/artifacts/`, `src/sqlite/`, `src/firmware/`, `src/pcap/`, `src/captures/`, `src/signals/`)**:
   - Inspectores especializados para reconstruir aplicaciones completas desde sus paquetes distribuidos.
5. **Supervisión de Procesos y Seguridad del Host (`src/process/`, `src/windows/`, `src/filesystem/`, `src/providers/`, `src/reference/`, `src/evaluation/`)**:
   - Garantizan que todo subproceso tenga dueño verificado, límites de memoria/tiempo y limpieza atómica al finalizar.
