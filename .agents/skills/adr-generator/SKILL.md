---
name: adr-generator
description: "Registro formal de Decisiones de Arquitectura (ADRs), evaluando contexto, alternativas descartadas, justificación de cambios de patrones legados y consecuencias técnicas."
---

# Architecture Decision Records (ADR Generator)

Esta habilidad captura, estructura y mantiene registros formales de decisiones de arquitectura (ADRs) bajo el formato MADR (Markdown Architectural Decision Records).

## Cuándo usar esta habilidad

- Documentar por qué se reemplaza una tecnología o patrón legado por uno moderno.
- Dejar constancia de elecciones técnicas críticas (e.g., base de datos, framework, estrategia de autenticación).
- Mantener la memoria técnica del proyecto accesible para nuevos desarrolladores y auditorías.

## Estructura de un ADR Canónico

Cada ADR debe nombrarse numéricamente (e.g., `ADR-001-adopcion-fastapi-clean-architecture.md`) y contener:

```markdown
# ADR-001: [Título corto en imperativo, ej: Adopción de Clean Architecture con FastAPI]

- **Estado:** [Propuesto | Aceptado | Reemplazado | Obsoleto]
- **Fecha:** YYYY-MM-DD
- **Autores:** [Nombre / Rol]
- **Decisores:** [Equipo de Arquitectura]

## Contexto y Declaración del Problema
Describir el problema actual o la limitación del sistema base legado (e.g., acoplamiento rígido, lógica de negocio dispersa en vistas).

## Opciones Consideradas
1. **Opción A:** [Descripción, pros y contras]
2. **Opción B:** [Descripción, pros y contras]
3. **Opción C:** [Descripción, pros y contras]

## Decisión Tomada
La opción elegida es **[Opción X]** porque [razones clave alineadas con los objetivos del proyecto].

## Consecuencias
### Positivas
- Desacoplamiento total entre infraestructura y lógica de negocio.
- Facilidad para escribir pruebas unitarias sin levantar base de datos.
### Negativas / Retos
- Curva de aprendizaje inicial en la estructura de capas y DTOs.
- Mayor cantidad de archivos de mapeo iniciales.

## Referencias
- [Vínculo a especificaciones técnicas o PRDs relacionados]
```
