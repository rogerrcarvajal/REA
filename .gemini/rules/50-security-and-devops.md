# 50 - Directrices de Seguridad, QA y Automatización DevOps

Aplica a la validación de código, pruebas, pipelines y gestión de despliegue.

---

## 1. Auditoría OWASP Top 10
Todo agente o desarrollador debe auditar activamente:
- **Inyección (SQL / Command Injection):** Sanitización estricta y parámetros vinculados.
- **Autenticación Rota:** Sesiones seguras con flags `HttpOnly`, `Secure` y `SameSite=Lax`.
- **Cross-Site Scripting (XSS):** Escape automático de salidas en plantillas y sanitización con librerías dedicadas.
- **Cross-Site Request Forgery (CSRF):** Tokens anti-CSRF validados en toda petición mutante (`POST`, `PUT`, `DELETE`).

---

## 2. Automatización con GitHub MCP
- El agente `qa-security-auditor` se encarga de:
  1. Validar que no haya tests fallidos antes de proponer cambios.
  2. Crear ramas de trabajo descriptivas: `feat/nombre-de-la-funcionalidad`.
  3. Crear Pull Requests utilizando la herramienta MCP de GitHub con:
     - Resumen ejecutivo del cambio.
     - Pruebas realizadas.
     - Checklist de verificación.
