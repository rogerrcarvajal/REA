# 10 - Arquitectura del Workspace y Ecosistema Políglota de Alto Impacto

Este documento define la arquitectura técnica del proyecto para soportar desarrollo políglota moderno y escalable.

---

## 1. Stack Tecnológico Soportado y Dimensionamiento

El workspace está optimizado para evolucionar de un prototipo monolítico a una arquitectura distribuida de microservicios:

| Capa / Dominio | Tecnologías Principales | Caso de Uso |
| :--- | :--- | :--- |
| **Microservicios de IA y Cómputo** | Python 3.11+, FastAPI, Pydantic v2, PyTorch, LangChain, uv | Inferencia de modelos, pipelines de datos, RAG y procesamiento analítico. |
| **Backend Web Core & APIs** | PHP 8.2+ (XAMPP / Laravel / Microframeworks), Composer | Lógica transaccional de negocio, APIs RESTful y gestión de usuarios. |
| **Frontend & Interfaces** | TypeScript, React / Next.js / Vue, Tailwind CSS | Interfaces web modernas, interactivas, responsivas y accesibles. |
| **Servicios de Alta Concurrencia** | Go / Rust (opcional según dimensión) | Procesamiento en tiempo real, web sockets masivos o ingestión de eventos. |
| **Persistencia & Caching** | MySQL / MariaDB (XAMPP), PostgreSQL con pgvector, Redis | Datos transaccionales, búsqueda semántica vectorial y caché en memoria. |

---

## 2. Patrón Arquitectónico Base: Hexagonal / DDD

Se implementa el patrón **Ports & Adapters (Arquitectura Hexagonal)** combinado con conceptos de **Domain-Driven Design (DDD)**:

```text
src/
├── core/
│   ├── domain/           # Entidades, Value Objects, Excepciones de Dominio (Cero dependencias)
│   │   └── models/
│   └── application/      # Casos de uso, DTOs, Puertos / Interfaces de repositorios
│       ├── use_cases/
│       └── ports/
└── infrastructure/       # Adaptadores de Entrada y Salida
    ├── http/             # Controladores, Middleware, Rutas API
    ├── persistence/      # Implementaciones con ORM/PDO/SQL, Repositorios concretos
    └── external_services/# Clientes de APIs externas, LLMs, MCPs
```

---

## 3. Flujo de Trabajo Obligatorio (Development Workflow)
1. **Fase 1: Planificación (`/plan`):**
   - No se escribe código sin un diagrama Mermaid de flujo y validación de entidades.
2. **Fase 2: Contratos de Interfaz (API-First):**
   - Se definen contratos OpenAPI o JSON Schema antes de integrar Frontend y Backend.
3. **Fase 3: Desarrollo Guiado por Pruebas (TDD/Unit Tests):**
   - Cobertura de pruebas unitarias sobre casos de uso de dominio.
4. **Fase 4: Verificación y Auditoría con GitHub MCP:**
   - Creación de ramas y Pull Requests automatizados con revisión de cambios.
