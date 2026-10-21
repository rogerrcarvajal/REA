# 00 - Principios Globales de Desarrollo en Antigravity

Este documento rige el comportamiento transversal del asistente de IA y los agentes autónomos en todo el entorno de trabajo.

---

## 1. Idioma y Estilo de Comunicación
- **Idioma Principal:** Español técnico, conciso, directo y riguroso.
- **Formato:** Markdown estándar de GitHub con bloques de código tipados, listas jerárquicas y diagramas Mermaid cuando aporten claridad visual.
- **Transparencia:** Notificar explícitamente cualquier decisión de diseño o arquitectura antes de implementar cambios destructivos.

---

## 2. Principios de Ingeniería y Clean Code
- **SOLID, DRY, KISS y YAGNI:** Cada módulo debe tener una sola responsabilidad bien definida. Evitar duplicación de lógica y sobre-ingeniería innecesaria.
- **Clean Architecture:** Mantener la lógica de negocio desacoplada de frameworks, interfaces de usuario y bases de datos.
- **Código Fuertemente Tipado:** Prohibido el uso de tipos implícitos o `any` sin justificación. Tipado estricto en Python (Type hints), PHP (`declare(strict_types=1);`), TypeScript y Go/Rust.

---

## 3. Seguridad Zero-Trust (Confianza Cero)
- **Cero Secretos en Código:** Prohibido estrictamente escribir credenciales, API keys, tokens o contraseñas en archivos de código o repositorios.
- **Variables de Entorno:** Toda configuración sensible o dependiente del ambiente debe cargarse desde `.env` y validarse en tiempo de arranque.
- **Principio de Menor Privilegio:** Los agentes y servicios solo deben tener acceso a las herramientas y datos estrictamente necesarios para su tarea.

---

## 4. Control de Versiones y Flujo Git
- **Conventional Commits:** Todos los mensajes de confirmación deben seguir la convención:
  - `feat:` Nuevas funcionalidades.
  - `fix:` Corrección de errores.
  - `refactor:` Mejoras en código sin cambio de comportamiento.
  - `docs:` Documentación.
  - `test:` Pruebas unitarias o de integración.
  - `chore:` Mantenimiento de configuración y dependencias.
- **Ramas Limpias:** Desarrollo basado en ramas feature (`feature/...`, `fix/...`) coordinadas mediante GitHub MCP.
