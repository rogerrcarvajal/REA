# Guía de Prompts y Metodología para Desarrollo de Issues por Sprints

**Proyecto:** Plataforma Inteligente de Gestión Wellness 2.0  
**Repositorio Oficial:** [`YaskCode-laboratory/wellness-platform-team2`](https://github.com/YaskCode-laboratory/wellness-platform-team2)  
**Propósito:** Proporcionar una plantilla de prompt estandarizada y reutilizable para disparar y controlar el desarrollo de cualquier Issue de software de un Sprint Técnico (Sprint 1, Sprint 2, etc.) en Antigravity.

---

## 📋 Plantilla Estandarizada de Prompt (Copiar y Usar)

Para iniciar el desarrollo de cualquier Issue (por ejemplo en el **Sprint 2**), copia el siguiente bloque en el chat de Antigravity completando las variables entre corchetes `<...>`:

```markdown
## INSTRUCCIÓN DE DESARROLLO DE ISSUE: SPRINT <NUMERO_SPRINT>

**1. Parámetros de Entorno y Rutas Locales:**
- **Ruta del Repositorio Local:** `D:\User\rcarvajal\Documents\LUZ - FEC\LUZ - M.Sc. en TIC\LUZ - FEC - M.Sc. en TIC - Sistemas Inteligentes\wellness-platform-team2`
- **Ruta de Recursos del Sprint <NUMERO_SPRINT>:** `D:\User\rcarvajal\Documents\LUZ - FEC\LUZ - M.Sc. en TIC\LUZ - FEC - M.Sc. en TIC - Sistemas Inteligentes\Sprint <NUMERO_SPRINT>\Github - Issues`

**2. Identificación del Issue a Desarrollar:**
- **Issue Target:** `S<NUMERO_SPRINT>-<NUMERO_ISSUE> - <TITULO_DEL_ISSUE>` (ej. S2-01 - Diseñar Búsqueda Híbrida BM25)
- **URL o Imagen de Referencia:** `<URL_DEL_ISSUE_O_NOMBRE_IMAGEN>`

**3. Estado de Trazabilidad Antecedente:**
- Indico que los issues anteriores se encuentran en la siguiente condición:
  - Issues S<NUMERO_SPRINT>-01 a S<NUMERO_SPRINT>-<N-1>: `<ESTADO_ANTECEDENTES>` (ej. S2-01 Aprobado en main / PR #XX Abierto en revisión).

**4. Especificación del Requerimiento:**
- **Objetivo Principal:** `<OBJETIVO_EXTRAIDO_DEL_ISSUE>`
- **Actividades Clave:** `<ACTIVIDADES_A_DESARROLLAR>`
- **Entregables Requeridos:** `<ENTREGABLES_EN_SRC_DOCS_TESTS>`
- **Criterios de Aceptación (Profesora Yaskelly / Líder Técnico):** `<CRITERIOS_DE_ACEPTACION>`

---

**TAREAS OBLIGATORIAS PARA EL ASISTENTE (ANTIGRAVITY):**
1. Revisa y confirma la sincronización del repositorio local con la rama `main` en GitHub.
2. Elabora el Plan de Implementación (Planning Mode) en `implementation_plan.md` y **espera mi aprobación explícita** antes de modificar código o crear la rama.
3. Una vez aprobado el plan, ejecuta el desarrollo modular en la rama `feature/s<NUMERO_SPRINT>-<NUMERO_ISSUE>-<slug>`.
4. Ejecuta el bucle de pruebas automatizadas (looping) hasta obtener 0 errores y 100% de cumplimiento de los criterios de aceptación.
5. Actualiza la matriz de trazabilidad en la documentación sin cerrar el Issue automáticamente (utiliza `Ref #<NUMERO_ISSUE>`).
6. Realiza commit acotado, push a GitHub y crea el Pull Request en el repositorio indicando los entregables y el estado de CI en verde (SUCCESS).
```

---

## 💡 Ejemplos Prácticos de Aplicación

### Ejemplo 1: Inicio del Sprint 2 (Issue S2-01)

```markdown
## INSTRUCCIÓN DE DESARROLLO DE ISSUE: SPRINT 2

**1. Parámetros de Entorno y Rutas Locales:**
- **Ruta del Repositorio Local:** `D:\User\rcarvajal\Documents\LUZ - FEC\LUZ - M.Sc. en TIC\LUZ - FEC - M.Sc. en TIC - Sistemas Inteligentes\wellness-platform-team2`
- **Ruta de Recursos del Sprint 2:** `D:\User\rcarvajal\Documents\LUZ - FEC\LUZ - M.Sc. en TIC\LUZ - FEC - M.Sc. en TIC - Sistemas Inteligentes\Sprint 2\Github - Issues`

**2. Identificación del Issue a Desarrollar:**
- **Issue Target:** `S2-01 - Implementar Búsqueda Híbrida Vectorial + BM25`
- **URL de Referencia:** `https://github.com/YaskCode-laboratory/wellness-platform-team2/issues/33`

**3. Estado de Trazabilidad Antecedente:**
- Sprint 1 completo (S1-01 a S1-05 Aprobados en main; S1-06 y S1-07 con PRs #31 y #32 en revisión).

**4. Especificación del Requerimiento:**
- **Objetivo Principal:** Diseñar e integrar la búsqueda híbrida combinando similitud densa 768d y búsqueda por texto completo BM25 (pgvector + tsvector) con Reciprocal Rank Fusion (RRF).
- **Actividades:**
  1. Extender `VectorStore` con índices BM25 y cálculo de RRF.
  2. Agregar filtrado por umbral de similitud ($\ge 0.35$).
  3. Crear suite de evaluaciones híbridas.
- **Entregables:** `src/rag/vector_store.py`, `docs/busqueda_hibrida.md`, `tests/test_hybrid_search.py`.
- **Criterios de Aceptación:** Hit Rate Global $\ge 90\%$, eliminación de falsos positivos en consultas out-of-domain `rag_q_004`, CI Passing 🟢.

**TAREAS OBLIGATORIAS PARA EL ASISTENTE (ANTIGRAVITY):**
1. Confirmar sincronización con main.
2. Elaborar el Plan de Implementación (Planning Mode) y esperar mi aprobación.
3. Desarrollar en bucle (looping) hasta pasar el 100% de pruebas.
4. Crear commit con `Ref #33` y publicar Pull Request en GitHub.
```

---

## 🔒 Reglas Inviolables de Calidad y Trazabilidad

1. **Planning Mode Obligatorio:** Nunca realizar modificaciones en archivos de código o crear ramas de Git sin antes presentar el `implementation_plan.md` y recibir la aprobación explícita del usuario.
2. **Looping de Autocorrección:** Si un comando de prueba o build falla, inspeccionar el log de error en silencio, corregir el código subyacente y re-ejecutar hasta lograr éxito completo.
3. **No Cierre Automático:** Usar únicamente `Ref #X` en los commits y PRs para permitir la revisión manual por parte de la profesora Yaskelly.
4. **Verificación CI:** Confirmar vía API de GitHub que las pruebas automatizadas de GitHub Actions completen con `status: completed` y `conclusion: success` antes de declarar el trabajo finalizado.
