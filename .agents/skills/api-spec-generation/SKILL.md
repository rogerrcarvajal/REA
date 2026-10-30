---
name: api-spec-generation
description: "Deducción automática de contratos REST/JSON, esquemas de entrada/salida y generación de especificaciones OpenAPI 3.1 / Swagger a partir de controladores, rutas y payloads existentes."
---

# API Specification Generation & Contratos REST

Esta habilidad deduce y formaliza contratos de interfaz a partir de código fuente existente (Express, FastAPI, Spring, Django, Laravel, etc.) o tráfico de red observado, generando especificaciones OpenAPI 3.1 y Swagger 2.0 listas para producción.

## Cuándo usar esta habilidad

- Extraer especificaciones OpenAPI 3.1 / Swagger a partir de controladores y rutas existentes.
- Deducir esquemas JSON de entrada (request body, params, headers) y salida (responses, error models).
- Crear contratos de interfaz limpios para desacoplar el frontend del backend en Clean-Room Design.
- Validar el cumplimiento de contratos entre sistemas integrados.

## Metodología de Extracción

### 1. Detección Automática de Endpoints
Examinar los archivos de rutas y controladores para extraer:
- **Método HTTP:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **Ruta canónica:** Normalizar parámetros (e.g., `/users/:id` -> `/users/{id}`).
- **Parámetros de entrada:** Path parameters, Query parameters, Headers requeridos.
- **Payloads (Request Body):** Analizar validaciones (Zod, Pydantic, Joi, Form Requests) para deducir tipos, campos obligatorios y opcionales.
- **Códigos de Estado y Respuestas:** Identificar respuestas exitosas (`200`, `201`) y errores comunes (`400`, `401`, `403`, `404`, `500`).

### 2. Separación entre Contrato Observado y Contrato Limpio
- **Contrato Observado (Legacy):** Refleja la realidad exacta del sistema base con todas sus inconsistencias (claves en snake_case/camelCase mezcladas, formatos de fecha heterogéneos).
- **Contrato Limpio (Clean Target):** Normaliza nombres, utiliza esquemas reutilizables en `components/schemas`, aplica respuestas de error consistentes (RFC 7807 Problem Details).

### 3. Plantilla OpenAPI 3.1 Canónica

```yaml
openapi: "3.1.0"
info:
  title: API Reconstruida - Clean Architecture
  version: "1.0.0"
  description: Contrato de servicios deducido y formalizado mediante deconstrucción arquitectónica.
paths:
  /api/v1/ejemplo:
    get:
      summary: Lista de recursos
      operationId: listRecursos
      responses:
        '200':
          description: Lista obtenida exitosamente
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/RecursoItem'
        '400':
          $ref: '#/components/responses/BadRequestError'
components:
  schemas:
    RecursoItem:
      type: object
      required:
        - id
        - nombre
      properties:
        id:
          type: string
          format: uuid
        nombre:
          type: string
          maxLength: 100
  responses:
    BadRequestError:
      description: Solicitud inválida
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              code:
                type: string
```
