# 🧰 Catálogo de Contratos MCP de REA y Flujo de Evidencia (`src/server/`)

> **Desarrollador Líder:** Rogerr Carvajal ([@rogerrcarvajal](https://github.com/rogerrcarvajal))  
> **Ubicación:** `Docs/03-Catalogo-MCP-y-Herramientas/01-Contratos-MCP-y-Flujo-Evidencia.md`  
> **Referencia de Código:** [`src/server/`](../../src/server), [`docs/mcp-contracts.md`](../../docs/mcp-contracts.md)

---

## 1. Organización de los Registros de Herramientas en `src/server/`

El servidor MCP de REA registra sus herramientas de forma modular a través de archivos `register*Tools.ts` en `src/server/`:

| Archivo Registro en `src/server/` | Herramientas Principales Expuestas | Dominio de Aplicación |
| :--- | :--- | :--- |
| **`registerSessionTools.ts` & `registerSessionStatusTool.ts`** | `open_binary`, `close_binary`, `binary_session`, `binary_overview` | Gestión del ciclo de vida de la sesión de análisis y disponibilidad de motores. |
| **`registerSessionRecordTools.ts` & `registerInvestigationTools.ts`** | `get_evidence_bundle`, `export_evidence_bundle`, `inspect_analysis_view`, `record_unknown`, `update_unknown`, `list_unknowns` | Retención de evidencia (`EvidenceLedger`), paginación en memoria y registro de incógnitas. |
| **`registerApplicationTools/`** | `analyze_javascript_application`, `trace_application_feature`, `compare_application_versions`, `project_apple_application_graph`, `project_mobile_application_graph`, `build_reconstruction_obligation_ledger`, `evaluate_reconstruction_coverage` | Reconstrucción de aplicaciones JavaScript/Electron, paquetes Apple (`.ipa`/`.app`/`.dmg`) y verificación de cobertura de reconstrucción. |
| **`registerNativeTools.ts` & `registerReverseEngineeringTools.ts`** | `analyze_function`, `procedure_pseudo_code`, `procedure_assembly`, `search_procedures`, `search_strings`, `xrefs`, `get_call_graph`, `trace_call_path`, `read_bytes`, `list_segments`, `address_to_file_offset`, `annotate_native_function` | Decompilación profunda de binarios nativos con Hopper, Ghidra, IDA o Kuna. |
| **`registerOfficialTools.ts`** | `inspect_artifact`, `extract_artifact`, `compare_artifacts`, `inspect_macho`, `trace_dylib_resolution`, `inspect_plist`, `decode_interface_builder`, `inspect_asset_catalog`, `inspect_signature`, `observe_native_calls` | Inspección de paquetes Apple (Mach-O, Dyld `@rpath`, Storyboards/NIBs, `Assets.car`, `Info.plist`, firmas CMS). |
| **`registerBrowserTools.ts` & `registerWeb*Tool.ts`** | `list_browser_targets`, `inspect_web_page`, `capture_browser_scenario`, `compare_web_captures`, `inspect_web_network_capture`, `discover_webmcp_tools` | Observación activa/pasiva de aplicaciones web, DOM, source maps, WebAssembly y capturas HAR/SAZ/qlog. |
| **`registerElectronTools.ts` & `registerJavaScript*Tools.ts`** | `list_electron_targets`, `inspect_electron_fuses`, `recover_javascript_source`, `observe_javascript_runtime` | Auditoría de aplicaciones Electron en vivo, fuses de seguridad y recuperación desde Source Maps. |
| **`registerAndroidTools.ts`, `registerAdbTools.ts`, `registerApktoolTools.ts`, `registerFlutterTools.ts`** | `inspect_android_package`, `inspect_apktool_resources`, `inspect_flutter_artifact`, herramientas ADB | Ingeniería inversa de paquetes `.apk`, snapshots de Dart/Flutter y dispositivos Android. |
| **`registerManagedTools.ts` & `registerManagedWorkflowTools.ts`** | `inspect_managed_artifact`, `inspect_managed_members`, `project_managed_application_graph`, `compare_managed_members` | Análisis estático de ensamblados `.NET` (PE/CLI e instrucciones CIL). |
| **`registerSqliteTools.ts`, `registerWasmTools.ts`, `registerEvmTools.ts`, `registerGoTools.ts`, `registerRustTools.ts`** | `inspect_sqlite_database`, `inspect_wasm_artifact`, `compare_wasm_interfaces`, `inspect_evm_interface`, `inspect_go_binary`, `inspect_rust_binary` | Inspección especializada de bases de datos SQLite, módulos WebAssembly, contratos EVM y binarios Go/Rust. |

---

## 2. Anatomía del Contrato `Evidence` en REA

Toda herramienta productora de REA devuelve un objeto canónico `Evidence` tanto en texto como en `structuredContent`:

```json
{
  "evidence_id": "ev_01j...",
  "operation": "analyze_javascript_application",
  "target": {
    "path": "C:/ruta/al/objetivo",
    "sha256": "a3f5..."
  },
  "analysis_profile": {
    "provider_id": "javascript-static",
    "parameters": {}
  },
  "normalized_result": {
    "coverage": {
      "scope": "container-entries",
      "status": "complete"
    }
  },
  "limitations": [],
  "_meta": {
    "provenance": {
      "untrusted_content": true,
      "source": "analysis_target"
    }
  }
}
```

### Flujo de Trabajo Recomendado con `Evidence`:
1. **Llamada Inicial Resumen (`detail: "summary"`):** Almacena el registro completo en el `EvidenceLedger` de la sesión y retorna un resumen ligero con `parent_evidence_id`.
2. **Navegación Focalizada (`inspect_analysis_view`):** Usa `parent_evidence_id` para consultar páginas de módulos, funciones, pseudocódigo, exports de Mach-O o tablas de símbolos sin re-ejecutar el motor de análisis.
3. **Construcción del Ledger de Obligaciones (`build_reconstruction_obligation_ledger`):** Convierte la evidencia observada en una lista auditable de componentes, contratos y funciones que tu nueva aplicación (por ejemplo, la versión adaptada para **iPad Pro M2**) debe cumplir.
4. **Evaluación de Cobertura (`evaluate_reconstruction_coverage`):** Compara la aplicación reconstruida frente al ledger de obligaciones original para certificar que ningún comportamiento crítico quedó omitido.
