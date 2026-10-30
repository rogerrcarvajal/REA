---
name: fastapi-patterns
description: "Patrones de arquitectura limpia y desarrollo backend de alto rendimiento con FastAPI, Python async/await, Pydantic V2, inyección de dependencias y separación de capas."
---

# FastAPI Modern Patterns & Clean Architecture

Esta habilidad define los estándares y patrones para construir microservicios y APIs robustas con FastAPI, Pydantic V2, programación asíncrona y separación estricta de capas.

## Cuándo usar esta habilidad

- Reconstruir el backend de una aplicación con FastAPI y Python 3.11+.
- Implementar validación y serialización estricta con Pydantic V2.
- Utilizar inyección de dependencias (`Depends`) para desacoplar base de datos, seguridad y servicios.
- Estructurar el código modularmente bajo Domain-Driven Design / Clean Architecture.

## Estructura Modular de Capas

```
app/
├── core/              # Configuración, seguridad, excepciones base
│   ├── config.py
│   └── security.py
├── domain/            # Entidades puras y excepciones de negocio
│   └── models.py
├── schemas/           # DTOs de Pydantic V2 (Input / Output)
│   └── property.py
├── services/          # Casos de uso y lógica de aplicación
│   └── property_service.py
├── repositories/      # Acceso a base de datos (SQLAlchemy / Async)
│   └── property_repository.py
└── api/               # Routers y controladores HTTP
    └── v1/
        └── properties.py
```

## Ejemplo Canónico de Router con Inyección de Dependencias

```python
from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from app.schemas.property import PropertyCreateDTO, PropertyResponseDTO
from app.services.property_service import PropertyService
from app.api.deps import get_property_service

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.post(
    "",
    response_model=PropertyResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva propiedad"
)
async def create_property(
    dto: PropertyCreateDTO,
    service: PropertyService = Depends(get_property_service)
):
    return await service.create_property(dto)
```

## Buenas Prácticas Clave
- Usar `async/await` en todas las operaciones de I/O (base de datos, red, almacenamiento).
- Validar siempre los datos con modelos Pydantic V2 estrictos.
- Nunca retornar entidades de base de datos directamente al cliente; mapear siempre a DTOs de respuesta.
