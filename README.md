# CONANP ERP — Frontend

Plataforma web para la **gestión de operación turística regulada en Áreas Naturales Protegidas (ANP)**. El frontend permite a cada organización administrar actividades, prestadores de servicios, permisos, activos, bloques horarios, capacidad y eventos operativos, con control de suscripción, pagos y reportes.

## Visión y objetivos

- **Experiencia de usuario clara y eficiente** para gestionar la operación turística según el modelo de negocio del backend.
- **Integración consistente y segura** con la API REST (`/api/v1`): autenticación JWT, multi-tenant y roles.
- **Multi-tenant:** el usuario puede pertenecer a varias organizaciones; la UI permite cambiar de organización y mostrar solo los datos del contexto actual.
- **Flujos completos:** registro, verificación de email, suscripción, actividades, eventos, activos, pagos y reportes.

## Dependencia, organización y activos

En el producto conviven dos niveles que a veces se nombran distinto en la API y en la UI:

- **Dependencia:** unidad operativa que agrupa varias **áreas** (ANP) donde aplica la misma gestión (prestadores, catálogos, etc.).
- **Organización (en la API):** el identificador que en rutas REST aparece como `:organizationId`. En la interfaz se presenta como **área / ANP**; es el contexto en el que el usuario trabaja y el que usa el backend para permisos y resolución.

**Activos:** el modelo de negocio y la API tratan el activo como **ámbito de dependencia**, no como un registro distinto “por cada área”. Un mismo activo no queda restringido en base de datos a una sola ANP: aplica a la dependencia y es visible según permisos en cada contexto.

**URLs y query params (p. ej. `areaId`):** cuando la ruta incluye un identificador de organización o un `areaId` en la query, no significa que el recurso “pertenezca” solo a esa área en el modelo de datos. Es el **contexto de llamada** que el frontend necesita para invocar endpoints del estilo `/api/v1/organizations/:organizationId/...`, alineado con el contrato del backend. Evitar en textos de producto la idea de que el activo es exclusivo de una ANP; en su lugar, hablar de **dependencia** o de **ámbito compartido** entre las áreas de esa dependencia.

Para detalle de endpoints, validar siempre `docs/api_routes/`.

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
