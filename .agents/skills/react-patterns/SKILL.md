---
name: react-patterns
description: "Patrones avanzados para desarrollo frontend con React y TypeScript: Server/Client components, hooks personalizados, inmutabilidad, composición y alto rendimiento."
---

# React Modern Patterns & Buenas Prácticas

Esta habilidad proporciona las directrices y patrones canónicos para construir aplicaciones React modernas, robustas, fuertemente tipadas y de alto rendimiento.

## Cuándo usar esta habilidad

- Diseñar y construir el frontend de una aplicación reconstruida con React y TypeScript.
- Estructurar componentes desacoplando la lógica de negocio (Custom Hooks) de la presentación.
- Implementar manejo de estado global predecible (Zustand, React Query).
- Optimizar la experiencia de usuario y el rendimiento (evitar re-renders innecesarios).

## Principios Fundamentales

### 1. Separación Presentacional vs Contenedor
- **Presentacional:** Componentes puros que solo reciben props y emiten eventos. Fáciles de testear y reutilizar en Storybook.
- **Contenedor / Smart:** Conectan con hooks de datos y pasan la información a los componentes presentacionales.

### 2. Custom Hooks para Casos de Uso
Toda lógica asíncrona, de datos o efectos secundarios debe encapsularse en un Custom Hook:

```typescript
export function useProperty(id: string) {
  const query = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePropertyDTO) => propertyService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property', id] }),
  });

  return {
    property: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProperty: updateMutation.mutateAsync,
  };
}
```

### 3. Patrones de Composición
- Preferir composición (`children`, `slots`) sobre herencia o props complejas de configuración.
- Utilizar **Compound Components** para componentes interactivos coordinados (e.g., `Tabs`, `Accordion`, `Select`).
