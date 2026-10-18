---
name: changelog-generator
description: Genera notas de lanzamiento y changelogs profesionales categorizados a partir de commits de Git, traduciendo jerga técnica en lenguaje claro para usuarios y GitHub Releases.
---

# Changelog Generator

Este skill transforma historiales técnicos de Git en notas de versión y changelogs pulidos, categorizados y orientados a usuarios y clientes.

---

## Cuándo usar este skill (Triggers)

- Al preparar notas de lanzamiento (*release notes*) para una nueva versión (`vX.Y.Z`).
- Al resumir las actualizaciones semanales o mensuales del producto.
- Al publicar un release o tag en GitHub mediante GitHub MCP.
- Al redactar avisos de actualización para tiendas de aplicaciones o correos informativos.
- Cuando el usuario solicite: *"Crea un changelog desde el último release"*, *"Genera notas de versión para v1.1.0"*, o *"Resume los commits de la última semana"*.

---

## Inputs necesarios

- Rango de análisis: tags (ej. `v1.0.0..v1.1.0`), fechas o últimos N días/commits.
- Rama de referencia (por defecto `main`).
- Opcional: Guía de estilo personalizada (ej. `CHANGELOG_STYLE.md`).

---

## 🧭 Flujo de Trabajo Recomendado (Plan → Validar → Ejecutar → Revisar)

1. **Fase 1: Planificación e Inspección Git**:
   - Identificar el rango exacto de commits: `git log --oneline <rango>`.
   - Confirmar si se filtran commits de refactorización pura o pruebas internas.
2. **Fase 2: Validación y Clasificación**:
   - Clasificar los commits según Conventional Commits:
     - `feat:` ➔ ✨ **Nuevas Características (New Features)**
     - `perf:` / `refactor:` ➔ ⚡ **Mejoras y Rendimiento (Improvements)**
     - `fix:` ➔ 🐛 **Correcciones de Errores (Fixes)**
     - `sec:` ➔ 🔒 **Seguridad (Security)**
     - `breaking change:` ➔ ⚠️ **Cambios Críticos (Breaking Changes)**
3. **Fase 3: Traducción y Redacción**:
   - Traducir la jerga técnica (ej. *"fix(db): PDO param binding typo in idx_est"*) a impacto para el usuario (ej. *"Se optimizó la estabilidad en la búsqueda de estudiantes"*).
   - Aplicar el tono profesional y la marca personal del proyecto.
4. **Fase 4: Revisión con Mini Checklist**:
   - [ ] ¿Se excluyeron commits redundantes o de mantenimiento interno?
   - [ ] ¿Cada ítem explica el beneficio o impacto para el usuario?
   - [ ] ¿Las secciones siguen el formato estándar Markdown?
   - [ ] ¿Se preservaron las referencias a issues (`Ref #X`)?

---

## 🎚️ Niveles de Libertad Operativa

- **Nivel de Libertad**: **Media Libertad (Plantillas)**.
- Se debe respetar rigurosamente la categorización por emojis y títulos Markdown, con flexibilidad estilística en la redacción de cada viñeta para maximizar la claridad.

---

## ⚠️ Manejo de Errores y Correcciones

- Si el comando Git no encuentra commits en el rango especificado, solicitar al usuario confirmar los tags existentes (`git tag -l`) antes de fallar.
- Si un commit tiene un mensaje críptico o ambiguo, inspeccionar el diff (`git show <hash> --stat`) para deducir el cambio real en lugar de inventarlo.

---

## Formato de Salida Estandarizado

```markdown
# 🚀 Notas de Lanzamiento - [Versión / Fecha]

## ✨ Nuevas Características
- **[Nombre de la funcionalidad]**: Descripción clara del valor aportado al usuario.
- **[Otra funcionalidad]**: Explicación concisa y accesible.

## ⚡ Mejoras
- **Rendimiento Acelerado**: Breve explicación de la mejora.
- **Experiencia de Usuario**: Optimización en flujos o interfaces.

## 🐛 Correcciones de Errores
- Corrección de fallo que impedía [acción].
- Solución a inconsistencia en [módulo].

## 🔒 Seguridad & Estabilidad
- Actualización de dependencias y refuerzo de sanitización de entradas.
```
