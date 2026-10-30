---
name: frontend-design
description: "Descomposición de interfaces de usuario en componentes atómicos reutilizables (Atomic Design: botones, modales, tablas, tarjetas) y diseño de sistemas visuales de alta fidelidad."
---

# Frontend Design & Extracción de Componentes Atómicos

Esta habilidad guía la deconstrucción visual y reconstrucción limpia de interfaces de usuario, organizando el frontend bajo la metodología de **Atomic Design** y estándares de diseño modernos y elegantes.

## Cuándo usar esta habilidad

- Deconstruir una interfaz de usuario existente en componentes reutilizables y modulares.
- Crear una biblioteca de componentes desacoplada de la lógica de datos.
- Aplicar sistemas de diseño modernos (glassmorphism, clean minimal, dark mode nativo).
- Garantizar accesibilidad (WCAG 2.1 AA), responsive design y tipado estricto en TypeScript.

## Metodología Atomic Design

```
Átomos -> Moléculas -> Organismos -> Plantillas -> Páginas
```

1. **Átomos (Atoms):**
   - Elementos indivisibles: Botón (`Button`), Input de texto (`Input`), Ícono (`Icon`), Badge (`Badge`), Tipografía (`Typography`).
2. **Moléculas (Molecules):**
   - Combinación de átomos con un propósito simple: Campo con etiqueta y validación (`FormField`), Selector con búsqueda (`SearchInput`), Item de lista (`ListItem`).
3. **Organismos (Organisms):**
   - Secciones completas de interfaz: Barra de navegación (`Navbar`), Modal interactivo (`Modal`), Tabla de datos con paginación (`DataTable`), Tarjeta informativa con acciones (`PropertyCard`).
4. **Plantillas (Templates):**
   - Estructura y layouts sin datos reales (Layouts de Dashboard, Autenticación, Detalle).
5. **Páginas (Pages):**
   - Instancia completa de una plantilla inyectada con datos de negocio del caso de uso.

## Contrato de Componente Limpio (Ejemplo TypeScript)

```typescript
// Componente Atómico: Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {isLoading ? <Spinner size={size} /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
```
