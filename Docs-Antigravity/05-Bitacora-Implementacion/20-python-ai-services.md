# 20 - Directrices para Microservicios de Python e Inteligencia Artificial

Aplica a cualquier archivo bajo directorios `python_services/`, `ai/`, `scripts/` o que tenga extensión `.py`.

---

## 1. Gestión del Entorno y Dependencias
- **Herramienta Estándar:** Utilizar `uv` o `poetry` para una resolución determinista y veloz de paquetes.
- **Python Version:** Python 3.11+ mínimo. Aprovechar mejoras de rendimiento y tipado moderno (`|` en lugar de `Union`).

---

## 2. Paradigma de Desarrollo y Tipado
- **Async-First:** Todos los endpoints con operaciones I/O intensivas (llamadas HTTP, consultas a bases de datos, APIs de LLMs) deben definirse con `async def` utilizando clientes no bloqueantes (`httpx`, `asyncpg`, `aiofiles`).
- **Pydantic v2:**
  - Todo input y output de endpoint o función pública debe validarse mediante modelos `pydantic.BaseModel`.
  - Habilitar `strict=True` o validaciones de campo cuando se manejen datos de usuario o pagos.

---

## 3. Integración con Modelos de IA y LLMs
- **Estrategia RAG y Embeddings:**
  - Los chunks de texto para bases vectoriales deben mantener metadatos enriquecidos (origen, timestamp, categoría).
- **Manejo de Errores y Cuotas:**
  - Implementar reintentos exponenciales con `tenacity` o lógica equivalente en llamadas a APIs de modelos.
  - Diseñar fallbacks controlados en caso de rate limits o caídas de proveedor.
