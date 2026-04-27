# AGENTS.md

This file provides guidance for AI agents (e.g., Claude, Codex, Copilot) working in this TypeScript + Express.js codebase.

---

## Project Overview

- **Runtime:** Node.js
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **Package Manager:** npm (or yarn — check `package.json` for lock file)

---

## Repository Structure

```
.
├── src/
│   ├── app.ts               # Express app setup (middleware, routes)
│   ├── server.ts            # Entry point — binds to port
│   ├── routes/              # Route handlers, grouped by resource
│   ├── controllers/         # Business logic called by routes
│   ├── middlewares/         # Custom Express middleware
│   ├── services/            # External integrations, DB access, etc.
│   ├── models/              # TypeScript interfaces/types and DB models
│   ├── utils/               # Shared helpers and utilities
│   └── config/              # Environment config, constants
├── tests/                   # Test files mirroring src/ structure
├── dist/                    # Compiled JS output (do not edit)
├── .env.example             # Template for environment variables
├── tsconfig.json
├── package.json
└── AGENTS.md
```

---

## Commands

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Start dev server (watch) | `npm run dev` |
| Build for production | `npm run build` |
| Start production server | `npm start` |
| Run tests | `npm test` |
| Lint | `npm run lint` |
| Type-check only | `npx tsc --noEmit` |

> Always run `npm run build` and `npm test` after making changes to confirm nothing is broken.

---

## TypeScript Conventions

- **Strict mode is on.** No implicit `any`. Avoid explicit `any` — use `unknown` and narrow.
- Use `interface` for object shapes, `type` for unions/intersections.
- Export types alongside their implementation files (not a separate `types/` barrel unless already established).
- Prefer `const` over `let`. Never use `var`.
- Use `async/await` consistently — do not mix with `.then()` chains.
- All async route handlers must be wrapped in error-catching middleware or a `try/catch`.

---

## Express Conventions

### Route Structure

Routes live in `src/routes/` and are mounted in `src/app.ts`. Keep route files thin — delegate logic to controllers.

```ts
// src/routes/users.ts
import { Router } from 'express';
import { getUser, createUser } from '../controllers/users';

const router = Router();

router.get('/:id', getUser);
router.post('/', createUser);

export default router;
```

### Controller Structure

Controllers handle request parsing and response formatting. Business logic belongs in services.

```ts
// src/controllers/users.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.findById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
```

### Error Handling

All errors must propagate via `next(err)`. A centralized error handler in `src/middlewares/errorHandler.ts` catches them.

```ts
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
};
```

Register it **last** in `src/app.ts`:

```ts
app.use(errorHandler);
```

---

## Environment Variables

- Never hardcode secrets or config. Use `process.env`.
- Document all variables in `.env.example` with placeholder values.
- Access config through `src/config/env.ts` (or equivalent) — validate at startup and throw if required variables are missing.

```ts
// src/config/env.ts
export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL is required'); })(),
};
```

---

## Testing

- Test files live in `tests/` mirroring `src/` structure (e.g., `tests/controllers/users.test.ts`).
- Use the existing test framework (check `package.json` — likely Jest or Vitest).
- Mock external services and DB calls in unit tests.
- Integration tests should use a test database or in-memory store.
- Do not commit tests that `console.log` or `console.error` unless guarded.

---

## Code Quality Rules

- Run `npm run lint` before considering a task done.
- Run `npx tsc --noEmit` to catch type errors without building.
- Do not disable ESLint rules with `// eslint-disable` without a comment explaining why.
- Do not suppress TypeScript errors with `// @ts-ignore` — fix the type properly.
- Keep functions small and single-purpose. If a function exceeds ~40 lines, consider splitting it.

---

## What Agents Should NOT Do

- Do not modify files in `dist/` — these are build artifacts.
- Do not commit `.env` files with real secrets.
- Do not introduce new dependencies without checking if an existing utility already covers the need.
- Do not change `tsconfig.json` compiler options without understanding the downstream impact.
- Do not use `require()` — use ES module `import/export` syntax throughout.
- Do not silently swallow errors (empty `catch` blocks).

---

## Pull Request / Commit Guidance

- Keep commits atomic and descriptive: `feat: add user login endpoint`, `fix: handle missing userId in getUser`.
- One logical change per PR where possible.
- Include a brief description of what changed and why in the PR body.
- All new routes and controllers should have at least one test.