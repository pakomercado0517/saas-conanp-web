# Sistema de diseño — CONANP ERP

---

## Paleta de colores (oficial del proyecto)

> **Usar SIEMPRE estos colores en futuras sesiones.** Definidos en `src/app/globals.css` como variables CSS.

| Variable        | Hex       | Uso                                       |
| --------------- | --------- | ----------------------------------------- |
| `--navy-deep`   | `#0a192f` | Fondo oscuro (nav, hero, footer, pricing) |
| `--navy-light`  | `#112240` | Cards sobre fondos navy                   |
| `--cyan-accent` | `#64ffda` | Acento, botones primarios, highlights     |
| `--cyan-hover`  | `#45d9b8` | Hover de botones cyan                     |
| `--light-grey`  | `#f8fafc` | Secciones claras, fondos alternos         |
| `--slate-text`  | `#8892b0` | Texto secundario sobre fondos oscuros     |

En Tailwind: `bg-[var(--navy-deep)]`, `text-(--cyan-accent)`, etc.

---

## Dirección y sensación

- **Dominio:** ANP (Áreas Naturales Protegidas), gestión turística regulada, operadores, prestadores, bloques horarios, capacidad.
- **Sensación:** Profesional, enterprise, tecnológico. Tema oscuro (navy) con acento teal/cyan.

## Estrategia de profundidad

- **Hero/Header/Footer:** Fondo navy con gradiente. Bordes con `border-[var(--cyan-accent)]/10`.
- **Cards:** `glass-card` (backdrop-blur, borde cyan suave) o cards sólidas con hover que revela borde cyan.
- **Sombras:** `shadow-2xl` en elementos destacados (hero image, card recomendada).

## Unidad base de espaciado

- Base: **4px** (0.25rem). Escala: 4, 8, 12, 16, 24, 32, 40, 48, 64.

## Tipografía

- **Headings:** Roboto Slab (serif).
- **Body:** Inter (sans-serif).
- **Headlines:** `font-bold`, `tracking-tight`.

## Patrones de componentes

### Cards (Features, sobre fondo blanco)

- `rounded-xl`, `p-8`
- `bg-[var(--light-grey)]`
- `border border-transparent` → `hover:border-[var(--cyan-accent)]/30`
- `hover:shadow-xl`
- Icono en contenedor `bg-[var(--navy-deep)]` → `group-hover:bg-[var(--cyan-accent)]`

### Cards (Pricing, sobre navy)

- `rounded-2xl`, `p-8`
- `bg-[var(--navy-light)]`
- `border border-white/5` o `border-2 border-[var(--cyan-accent)]` (plan destacado)
- Card recomendada: `scale-105`, `shadow-2xl`

### Botones primarios (cyan)

- `bg-[var(--cyan-accent)]`
- `text-[var(--navy-deep)] font-bold`
- `hover:bg-[var(--cyan-hover)]`
- `rounded` con `py-3`

### Botones outline (cyan)

- `border border-[var(--cyan-accent)]/30`
- `text-(--cyan-accent)`
- `hover:bg-[var(--cyan-accent)]/5`

### Iconos

- Lucide React (Waves, ShieldCheck, CalendarDays, BarChart3, CheckCircle2, XCircle, PlayCircle).

### Header sticky

- `sticky top-0 z-50`
- `border-b border-zinc-200/80`
- `bg-white/95 backdrop-blur`

## Responsive

- Grid de features: 1 col → 2 cols (sm) → 3 cols (lg).
- Grid de pricing: 1 col → 3 cols (lg).
- Grid de stats: 1 col → 2 cols (sm) → 3 cols (lg).
- Padding horizontal: `px-4 sm:px-6 lg:px-8`.
- Max-width contenido: `max-w-6xl` (pricing, features) o `max-w-4xl` (hero).

## Rutas de navegación

- Header: Iniciar sesión (`/login`), Empezar Ahora (`/register`).
- CTA final: Empezar Ahora (`/register`).
- Plan Empresarial: Hablar con Ventas (`mailto:`).
