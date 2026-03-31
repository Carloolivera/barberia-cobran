# Contributing

Gracias por tu interés en contribuir. Este proyecto es un sistema de turnos online para una barbería real.

## Setup local

Ver [README.md](./README.md) para instrucciones completas de instalación, variables de entorno y base de datos.

## Tests

```bash
npm run test           # correr todos los tests
npm run test:watch     # modo watch
npm run test:coverage  # reporte de cobertura
```

Requisito mínimo: **80% de cobertura** en archivos de lógica de negocio (`actions/`, `lib/rate-limit.ts`).

## Flujo de trabajo

1. Crear una branch desde `master`: `git checkout -b feature/nombre`
2. Hacer commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
3. Asegurarse de que el CI pase (typecheck + tests) antes de abrir el PR
4. Abrir un Pull Request describiendo qué cambia y por qué

## CI/CD

Cada push y PR ejecuta automáticamente:
- TypeScript typecheck (`tsc --noEmit`)
- Tests con cobertura (`vitest run --coverage`)

El merge a `master` requiere que el CI esté verde.
