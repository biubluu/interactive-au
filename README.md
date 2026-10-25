# Interactive AU

Phase 1 foundation for a single alternate-universe story, presented through a fictional phone simulation in the browser. The current page is explicitly **PLACEHOLDER** content. The phone UI, virtual apps, story runtime, and persistence are not implemented.

Read [AGENTS.md](AGENTS.md) and [docs/architecture.md](docs/architecture.md) before making changes. Project documentation is in English; reports to the user are in Indonesian.

## Requirements

Use Node.js 24 (see `.nvmrc`) and npm. Run all commands from `interactive-au/`. On Windows PowerShell, use `npm.cmd` or `npx.cmd` if execution policy blocks the corresponding `.ps1` shim.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Dependencies are saved at exact versions and the lockfile must be tracked in Git. No environment variables, account, backend, or external runtime services are required.

## Checks

```sh
npm run lint
npm run type-check
npm test
npm run build
```

`npm run type-check` first generates Next.js route types, then runs strict TypeScript checks. `npm test` runs Vitest once; `npm run test:watch` enables watch mode.

The production build generates `out/`. Check that `out/index.html`, `out/404.html`, and `out/_next/static/` exist. Deploy the contents of `out/` to a static host that serves directory index files. No Node.js process is needed in production.

```sh
npm run preview
```

This serves the existing export at `http://localhost:3000`; it does not rebuild. Do not use `next start` with static export.

## End-to-end tests

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright starts and stops the static preview server automatically. Port 3000 must be free. Tests run against desktop and mobile Chromium, exercising keyboard entry, placeholder navigation, reload, viewport fit, and reduced motion. Browser downloads require network access. Additional browser engines are outside this phase.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type checking, unit tests, production build, and static artifact verification on pushes and pull requests using Node 24 and `npm ci`. E2E is configured for local execution and is not part of this initial CI job.

The workflow assumes this `interactive-au/` directory is the Git repository root. A local repository is initialized for the foundation commit, including the lockfile. No remote is configured and nothing is published. If retaining it as a subdirectory in another repository, move the workflow to that repository's root `.github/workflows/` and adjust its working directory and lockfile path.

## Scope

Only `src/app` is needed now. The five architectural layers remain documented boundaries; implementation folders are added when their phase is requested. Motion, Zustand, and Zod are installed but deliberately unused in this phase. No device UI or story logic is implied by the landing page.
