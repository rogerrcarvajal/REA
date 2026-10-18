# 30 - Directrices para Backend Core (PHP / APIs Transaccionales)

Aplica a código PHP bajo el entorno XAMPP (`api/`, `backend/`, `src/` o archivos `.php`).

---

## 1. Estándares de la Comunidad PHP (FIG)
- **PSR-4:** Estructura de directorios y nombres de espacios para autocarga limpia.
- **PSR-7 & PSR-15:** Interfaces HTTP y middlewares estandarizados.
- **PSR-12:** Formato de código estricto. Incluir siempre `declare(strict_types=1);` al inicio de cada archivo PHP.

---

## 2. Seguridad en Base de Datos
- **Consultas Preparadas:** Prohibido concatenar variables en sentencias SQL. Usar siempre PDO con Prepared Statements y parámetros vinculados (`:param`).
- **Manejo de Transacciones:** Operaciones que afecten múltiples tablas deben encapsularse dentro de bloques transaccionales (`beginTransaction`, `commit`, `rollBack`).

---

## 3. Formato Unificado de Respuestas API
Todos los endpoints REST deben responder con la siguiente estructura JSON uniforme:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada con éxito",
  "meta": { "timestamp": "2026-10-07T12:00:00Z" }
}
```

En caso de error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "El campo email no tiene un formato válido",
    "details": []
  }
}
```
