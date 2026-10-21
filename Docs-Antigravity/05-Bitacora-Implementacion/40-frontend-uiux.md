# 40 - Directrices de Diseño UI/UX y Frontend

Aplica a componentes de interfaz de usuario (`frontend/`, `views/`, `components/`, `.html`, `.js`, `.ts`, `.tsx`, `.vue`).

---

## 1. Sistema de Diseño y Tokens Semánticos
- **Tailwind CSS:** Emplear clases de utilidad respetando una escala consistente de espaciados y paleta de colores.
- **Sin Valores Arbitrarios:** Evitar valores manuales (`w-[347px]`). Usar tokens del sistema (`w-full`, `max-w-md`, etc.).

---

## 2. Accesibilidad y Estándares WCAG 2.1 AA
- **Semántica HTML:** Utilizar `<header>`, `<main>`, `<nav>`, `<article>`, `<button>` en lugar de `<div>` con manejadores de clic.
- **Navegación por Teclado:** Todo control interactivo debe tener indicadores de foco visibles (`focus-visible:ring-2`).
- **Contraste de Color:** Ratios de contraste superiores a 4.5:1 para texto normal y 3:1 para elementos de interfaz.

---

## 3. Manejo Exhaustivo de Estados de Componente
Todo componente que consuma datos asíncronos debe implementar obligatoriamente:
1. **Estado Inicial / Idle:** Vista limpia antes de disparar la acción.
2. **Estado de Carga / Loading:** Skeletons o spinners sutiles (evitar parpadeos de layout).
3. **Estado de Éxito / Success:** Despliegue de los datos obtenidos.
4. **Estado Vacío / Empty State:** Mensaje orientativo y botón de acción (CTA) cuando no existan registros.
5. **Estado de Error / Error State:** Mensaje claro de recuperación con opción de reintentar.
