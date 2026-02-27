# ✂️ Barbería Cobrán — Sistema de Turnos Online

Sistema de reservas online para **Barbería Cobrán** (Chascomús, Buenos Aires).
Permite a los clientes reservar turnos sin llamadas, con confirmación instantánea.

**Producción:** https://barberia-cobran.vercel.app
**Desarrollado por:** [AIDO Digital Agency](https://aidoagencia.com)

---

## 🗂 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Base de datos | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 (con Driver Adapter) |
| Auth | next-auth v5 (admin) |
| Deploy | Vercel |
| Pagos | — (sin pagos online, reservas sin pago anticipado) |

---

## 🚀 Correr en local

### 1. Clonar y preparar

```bash
git clone https://github.com/Carloolivera/barberia-cobran.git
cd barberia-cobran
npm install
```

### 2. Variables de entorno

Crear `.env.local` con:

```env
DATABASE_URL="postgresql://..."        # Neon connection string
AUTH_SECRET="..."                       # Generar con: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

> Con Vercel CLI: `vercel env pull .env.local --yes`

### 3. Sincronizar DB

```bash
npx prisma db push
npx prisma db seed     # Carga servicios y configuración base
```

### 4. Levantar dev server

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🧱 Estructura del Proyecto

```
app/
├── (public)/           # Landing page + wizard de reservas
│   ├── layout.tsx      # Header sticky + footer
│   ├── page.tsx        # Home: hero, servicios, pasos, reservar
│   └── mi-turno/       # Consulta de turno por teléfono
├── (admin)/admin/      # Panel administrativo
│   ├── page.tsx        # Dashboard
│   └── turnos/         # Gestión de turnos con filtros
└── api/auth/           # next-auth endpoints

actions/
├── appointments.ts     # CRUD de turnos (server actions)
├── settings.ts         # Configuración del negocio
└── services.ts         # Servicios del negocio

components/
├── booking/
│   └── booking-wizard.tsx   # Wizard público de reservas (4 pasos)
├── admin/
│   └── appointments-table.tsx  # Tabla de turnos con filtros
└── ui/                 # shadcn/ui components

prisma/
├── schema.prisma       # Modelos: Appointment, Service, Settings, BlockedDate
├── prisma.config.ts    # Driver Adapter para Neon
└── seed.ts             # Datos iniciales
```

---

## 🔐 Admin

Acceso: `/admin/login`

```
Email:    admin@barberia-cobran.com  (o el configurado en seed)
Password: (configurado en AUTH_SECRET / seed)
```

Funcionalidades del panel:
- Ver / filtrar turnos por estado (Pendiente / Confirmado / Cancelado) y fecha
- Confirmar / cancelar turnos
- Eliminar turnos inválidos
- Gestionar servicios y horarios de atención

---

## 📋 Flujo de Reserva (público)

1. **Elegí servicio** — Cards con nombre, duración y precio
2. **Elegí fecha** — Calendar picker (14 días adelante, días activos del negocio)
3. **Elegí horario** — Solo slots disponibles según agenda del día
4. **Confirmá tus datos** — Nombre + teléfono → se genera el turno

---

## ⚙️ Prisma en Vercel (nota técnica)

Prisma 7 requiere **Driver Adapter** para funcionar en entornos Edge/Serverless:

```ts
// prisma.config.ts
import { defineConfig } from "prisma/config";
import { PrismaNeon } from "@prisma/adapter-neon";
export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
});
```

El cliente generado vive en `lib/generated/prisma/client.ts` (en `.gitignore`).

---

## 🚢 Deploy

El proyecto se deploya automáticamente en **Vercel** en cada push a `master`.

Variables de entorno requeridas en Vercel:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `AUTH_SECRET` — Secret para next-auth
- `NEXTAUTH_URL` — URL de producción

---

*Desarrollado con ❤️ por [AIDO Digital Agency](https://aidoagencia.com) — Chascomús, Buenos Aires*
