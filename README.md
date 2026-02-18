# CONANP ERP — Frontend

Plataforma web para la **gestión de operación turística regulada en Áreas Naturales Protegidas (ANP)**. El frontend permite a cada organización administrar actividades, prestadores de servicios, permisos, activos, bloques horarios, capacidad y eventos operativos, con control de suscripción, pagos y reportes.

## Visión y objetivos

- **Experiencia de usuario clara y eficiente** para gestionar la operación turística según el modelo de negocio del backend.
- **Integración consistente y segura** con la API REST (`/api/v1`): autenticación JWT, multi-tenant y roles.
- **Multi-tenant:** el usuario puede pertenecer a varias organizaciones; la UI permite cambiar de organización y mostrar solo los datos del contexto actual.
- **Flujos completos:** registro, verificación de email, suscripción, actividades, eventos, activos, pagos y reportes.

## Stack técnico

- **Framework:** Next.js 16 (App Router)
- **Estado y datos:** @tanstack/react-query, Zustand
- **Formularios:** react-hook-form + validación con Zod
- **UI:** Tailwind CSS v4, Lucide React
- **Gráficos:** Recharts
- **Pagos:** Stripe

## Inicio rápido

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | Ejecutar ESLint |

## Estructura del proyecto

```
src/
├── app/              # Rutas y layouts (Next.js App Router)
├── features/         # Lógica por dominio
│   ├── auth/
│   ├── organizations/
│   ├── subscriptions/
│   ├── activities/
│   ├── blocks/
│   ├── providers/
│   ├── assets/
│   ├── events/
│   ├── payments/
│   ├── reports/
│   └── access-products/
├── shared/           # Componentes, hooks y utilidades reutilizables
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── ui/
│   └── types/
└── middleware.ts
```

Cada feature sigue la estructura: `components/`, `hooks/`, `services/`, `schemas/`, `types.ts`.

## Módulos principales

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Registro, login, verificación de email, recuperar contraseña |
| **Organizaciones** | Crear, listar, seleccionar organización; config-acceso (brazaletes) |
| **Suscripción** | Planes, contratar, gestionar, facturas |
| **Memberships** | Miembros, invitaciones, roles (admin, gestor, prestador, observador) |
| **Actividades** | CRUD; tipos BLOQUES / HORARIO_LIBRE |
| **Bloques** | Bloques horarios por actividad |
| **Prestadores** | Perfiles, permisos por actividad |
| **Activos** | Embarcaciones, vehículos, guías; aprobación (admin) |
| **Eventos** | Crear, editar, pagos, evidencias |
| **Reportes** | Operativos, stock, ventas (brazaletes) |

## API y backend

- **Base URL:** Configurable por variable de entorno
- **Documentación:** `docs/api_routes/` (OpenAPI/Swagger en `/api-docs` del backend)
- **Autenticación:** JWT (access + refresh token)
- **Respuesta exitosa:** `{ success: true, data, message?, pagination? }`
- **Error:** `{ success: false, error, message, code?, details? }`

## Diseño

- **Design system:** `.interface-design/system.md`
- **Paleta:** Navy (#0a192f), Cyan (#64ffda), etc. Definidos en `src/app/globals.css`
- **Stitch MCP:** Diseños UI en proyecto `projects/15467188114608234801` (ver reglas en `.cursor/rules/`)

## Documentación

- **PRD:** `docs/PRD/PRD-Frontend-CONANP.md`
- **API:** `docs/api_routes/`
- **Reglas del proyecto:** `.cursor/rules/rules.mdc`
