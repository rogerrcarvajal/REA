---
name: c4-model
description: "Diagramación y documentación de arquitectura de software en 4 niveles (Contexto, Contenedores, Componentes, Código) con Mermaid para modelar sistemas limpios y desacoplados."
---

# C4 Model: Arquitectura y Diagramación

Esta habilidad estructura y genera documentación de arquitectura siguiendo la metodología C4 (Context, Containers, Components, Code) mediante diagramas Mermaid renderizables.

## Cuándo usar esta habilidad

- Documentar la arquitectura de un sistema deconstruido de alto a bajo nivel.
- Planificar la nueva arquitectura desacoplada antes de escribir código de implementación.
- Comunicar decisiones técnicas a stakeholders de negocio (Contexto/Contenedores) y a desarrolladores (Componentes/Código).

## Los 4 Niveles de la Arquitectura C4

### Nivel 1: Diagrama de Contexto de Sistema (System Context)
Muestra el sistema en el centro, los usuarios/actores que interactúan con él y los sistemas externos de soporte.

```mermaid
graph TD
    User["Usuario Final<br/>[Persona]"]
    System["Sistema Principal (Reconstruido)<br/>[Software System]"]
    ExternalAuth["Proveedor OAuth2<br/>[External System]"]
    ExternalStorage["Almacenamiento S3<br/>[External System]"]

    User -->|Utiliza via HTTPS| System
    System -->|Autentica via| ExternalAuth
    System -->|Almacena archivos en| ExternalStorage
```

### Nivel 2: Diagrama de Contenedores (Containers)
Desglosa el sistema en aplicaciones ejecutables, APIs, workers y almacenes de datos.

```mermaid
graph TD
    Client["Single Page App / PWA<br/>[React + Vite + TS]"]
    API["API Gateway & Core Service<br/>[FastAPI / Python]"]
    Worker["Async Background Worker<br/>[Python Celery / Redis]"]
    DB[("Base de Datos Relacional<br/>[PostgreSQL]")]
    Cache[("Caché en Memoria<br/>[Redis]")]

    Client -->|Llamadas REST / WebSocket| API
    API -->|Consulta y persiste| DB
    API -->|Caché de sesiones| Cache
    API -->|Encola tareas| Worker
    Worker -->|Procesa datos| DB
```

### Nivel 3: Diagrama de Componentes (Components)
Dentro de un contenedor clave (e.g., el backend), muestra los módulos lógicos: controladores, servicios de caso de uso, adaptadores y repositorios.

```mermaid
graph TD
    subgraph Container_API ["Contenedor API Backend"]
        Router["Router / Controladores HTTP"]
        AuthMiddleware["Middleware de Seguridad"]
        UseCaseService["Servicio de Casos de Uso (Dominio)"]
        RepoAdapter["Adaptador de Persistencia"]
    end

    Router --> AuthMiddleware
    AuthMiddleware --> UseCaseService
    UseCaseService --> RepoAdapter
```

### Nivel 4: Diagrama de Código (Code)
Detalla la estructura interna de componentes complejos: interfaces, clases y modelos de dominio.
