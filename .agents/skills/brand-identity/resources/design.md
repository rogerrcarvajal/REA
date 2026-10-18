# CEIA / SWGA Design System & Brand Identity Tokens

## 1. Color Palette & Dark Mode Tokens

The CEIA / SWGA brand aesthetic is centered around a modern, high-tech, futuristic dark interface with glassmorphism effects and neon accents.

```css
:root {
  /* Surface & Backgrounds */
  --bg-dark-primary: #0b0f19;
  --bg-dark-surface: #111827;
  --bg-dark-card: #1e293b;
  --bg-glass: rgba(30, 41, 59, 0.7);
  --bg-glass-hover: rgba(51, 65, 85, 0.8);

  /* Brand Accents & Gradients */
  --accent-cyan: #38bdf8;
  --accent-indigo: #6366f1;
  --accent-purple: #8b5cf6;
  --gradient-brand: linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%);
  --gradient-card-glow: radial-gradient(circle at top left, rgba(56, 189, 248, 0.15), transparent 70%);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-accent: #38bdf8;

  /* Borders & Glass Dividers */
  --border-glass: rgba(255, 255, 255, 0.1);
  --border-active: rgba(56, 189, 248, 0.4);

  /* Status Colors */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;

  /* Shadows & Effects */
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --blur-glass: blur(12px);
}
```

---

## 2. Typography Guidelines

- **Primary Font Family**: `'Inter', 'Outfit', system-ui, -apple-system, sans-serif`
- **Headings**:
  - `h1`: `font-size: 2.25rem; font-weight: 700; letter-spacing: -0.025em; line-height: 1.2;`
  - `h2`: `font-size: 1.75rem; font-weight: 600; letter-spacing: -0.02em;`
  - `h3`: `font-size: 1.25rem; font-weight: 600;`
- **Body**: `font-size: 1rem; line-height: 1.6; font-weight: 400;`

---

## 3. UI Component Patterns

### Glassmorphic Card Pattern

```css
.card-glass {
  background: var(--bg-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-glass);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-glass:hover {
  border-color: var(--border-active);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(56, 189, 248, 0.15);
}
```

### Action Button Pattern

```css
.btn-primary {
  background: var(--gradient-brand);
  color: #ffffff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}
```

---

## 4. UI Design Rules

1. **High Visual Impact**: Avoid basic white background / plain black text templates. Use curated dark mode.
2. **Dynamic States**: Every button, link, and interactive card must have smooth hover and active state transitions.
3. **No Static Pixel Offsets**: Responsive layouts must use CSS Grid / Flexbox and relative bounds.
4. **Unique IDs for Testing**: Every form input and interactive button must include a unique, descriptive HTML `id` attribute.
