---
name: prd-generator
description: "Generación de documentos de requerimientos de producto (PRD), especificaciones técnicas e historias de usuario a partir del análisis y comportamiento deconstruido del sistema base."
---

# PRD Generator (Especificación Funcional Inversa)

Esta habilidad sintetiza el comportamiento observado y deconstruido de un sistema existente para generar Documentos de Requerimientos de Producto (PRD) completos, especificaciones funcionales e historias de usuario con criterios de aceptación precisos.

## Cuándo usar esta habilidad

- Convertir una aplicación existente o prototipo en una especificación funcional rigurosa.
- Formalizar los requerimientos para que un equipo de desarrollo pueda recrear el sistema de forma limpia (Clean-Room).
- Definir límites del producto, casos de borde y reglas de negocio sin ambigüedades.
- Preparar historias de usuario listas para sprint planning e issues de seguimiento.

## Estructura del Documento PRD

Un PRD generado mediante deconstrucción debe incluir:

### 1. Resumen Ejecutivo y Declaración del Problema
- **Problema de Negocio:** Qué dolor resuelve la aplicación para sus usuarios.
- **Visión de la Solución:** Enfoque arquitectónico y funcional de la nueva versión reconstruida.

### 2. Personas y Flujos de Usuario Principales
- **Perfiles de Usuario:** Roles y permisos (e.g., Administrador, Operador, Cliente).
- **Flujos Paso a Paso:** Pasos requeridos para completar los objetivos principales.

### 3. Requerimientos Funcionales (FR)
Matriz detallada:
| ID | Módulo | Descripción Funcional | Prioridad (MoSCoW) |
|----|--------|-----------------------|--------------------|
| FR-001 | Auth | Autenticación mediante JWT con soporte OAuth2 | Must |
| FR-002 | Dashboard | Visualización en tiempo real de métricas | Should |

### 4. Historias de Usuario y Criterios de Aceptación (Gherkin)
```gherkin
Escenario: Registro de nueva propiedad
  Dado que un usuario con rol "Agente" ha iniciado sesión
  Cuando envía los datos de la propiedad con todos los campos obligatorios
  Entonces el sistema registra la propiedad con estado "Borrador"
  Y devuelve el identificador UUID generado con código HTTP 201
```

### 5. Requerimientos No Funcionales (NFR)
- Rendimiento (tiempos de respuesta p95 < 200ms).
- Disponibilidad y resiliencia.
- Seguridad (cifrado en reposo y en tránsito, RBAC).
- Compatibilidad multi-dispositivo y offline-first si aplica.
