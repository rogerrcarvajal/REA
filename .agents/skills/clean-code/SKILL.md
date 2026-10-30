---
name: clean-code
description: "Principios de Clean Code (Uncle Bob), SOLID, DRY, KISS, YAGNI y Arquitectura Hexagonal (Ports & Adapters) para reconstrucción en código limpio (Clean-Room Design)."
---

# Clean Code & Clean-Room Architecture

Esta habilidad establece las reglas obligatorias de calidad, arquitectura y diseño para reconstruir software desde cero mediante **Clean-Room Design**, evitando arrastrar vicios, dependencias o anti-patrones del sistema base.

## Cuándo usar esta habilidad

- Escribir o refactorizar código de producción en el nuevo sistema reconstruido.
- Implementar separación estricta de capas bajo Arquitectura Hexagonal / Clean Architecture.
- Revisar pull requests y evaluar que el código cumpla estándares SOLID, DRY, KISS y YAGNI.
- Asegurar que la lógica de negocio permanezca pura, sin acoplamiento a frameworks o bases de datos.

## Protocolo Clean-Room Design

1. **Aislamiento de Especificación:** La reconstrucción se basa en el **PRD**, los **Contratos de API (OpenAPI)** y los **Modelos DER**, nunca copiando código fuente crudo del sistema legado.
2. **Cero Dependencias Legadas:** No importar librerías obsoletas ni emular vicios de diseño antiguos.
3. **Test-Driven Verification:** Cada caso de uso debe contar con pruebas unitarias que verifiquen el contrato de comportamiento.

## Arquitectura Hexagonal: Capas y Responsabilidades

```
[ Infraestructura: HTTP, CLI, DB, Storage ]  <-- Capa Externa
              ↓ (implementa puertos)
[ Adaptadores: Repositorios, Controladores ]
              ↓ (llama casos de uso)
[ Aplicación: Casos de Uso / Use Cases ]
              ↓ (opera sobre entidades)
[ Dominio: Entidades Puras & Reglas de Negocio ]  <-- Núcleo Puro
```

- **Dominio (Domain):** Entidades puras y reglas de validación de negocio. Cero dependencias externas.
- **Aplicación (Application):** Casos de uso (`CreatePropertyUseCase`, `AuthenticateUserUseCase`). Orquestan el flujo.
- **Puertos (Ports):** Interfaces que definen contratos necesarios (`PropertyRepositoryPort`, `NotificationServicePort`).
- **Adaptadores (Adapters):** Implementaciones concretas (`PostgresPropertyRepository`, `FastApiPropertyController`).

## Principios SOLID de Oro

- **S (Single Responsibility):** Una clase o función debe tener una y solo una razón para cambiar.
- **O (Open/Closed):** Abierto para extensión, cerrado para modificación.
- **L (Liskov Substitution):** Los subtipos deben ser sustituibles por sus tipos base sin romper el programa.
- **I (Interface Segregation):** Interfaces pequeñas y específicas en lugar de interfaces gordas multipropósito.
- **D (Dependency Inversion):** Depender de abstracciones (interfaces), no de implementaciones concretas.
