# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.0.0] — 2026-03-31

### Added
- Sistema completo de reservas online con wizard de 4 pasos (servicio → fecha → horario → datos)
- Panel de administración con autenticación (`/admin`)
- Gestión de turnos: confirmar, cancelar, eliminar, filtrar por estado y fecha
- Configuración de horarios de atención y servicios desde el panel
- Rate limiting in-memory (5 intentos / 15 min por IP) en login y consulta de turnos
- Security headers HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Suite de tests con Vitest: 90 tests, 98.5% de cobertura
- Pipeline CI/CD con GitHub Actions (typecheck + tests en cada push/PR)
- Branch protection en `master` (requiere CI verde para merge)

### Stack
- Next.js 16 + React 19 + TypeScript
- Prisma 7 + PostgreSQL (Neon serverless)
- next-auth v5
- Tailwind CSS v4 + shadcn/ui
- Vercel (deploy automático)
