# Interactive AU

Phase 4 adds responsive swipe unlock, restrained spring transitions, icon press feedback, and refined lock/home visuals inside the fictional Device Shell. The experience opens locked, with a deterministic placeholder clock/date. Swipe up from the marked lower region or use the Unlock button. Each placeholder icon opens an informational view and can return home. Real virtual app functionality, story runtime, and persistence are not implemented.

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

Playwright starts and stops the static preview server automatically on port 4173, keeping the default development server on port 3000 separate. Port 4173 must be free. Tests run against desktop and mobile Chromium, exercising unlock/relock, app placeholder navigation, keyboard focus restoration, deterministic reload, simulated shortcuts, viewport fit, reduced motion, device clipping, and axe accessibility checks. Browser downloads require network access. Additional browser engines are outside this phase.

The viewport matrix runs once in the desktop project; eight duplicate matrix cases are intentionally skipped in the mobile project. The CDP touch test runs only in mobile Chromium, so one desktop copy is also intentionally skipped. Current screenshots for mobile, tablet, desktop, landscape, dark surroundings, and enlarged text are generated in `artifacts/phase-4/` (ignored by Git). Tests cover pointer-following drag, short/invalid/cancelled swipes, blur, rapid and interrupted navigation, press feedback, focus restoration, and reduced-motion hydration/preferences. See [docs/design-system.md](docs/design-system.md) for geometry, motion rules, screenshot names, and zoom-test limitations. On restricted Windows environments, browser testing may require permission to launch and terminate the preview process.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type checking, unit tests, production build, and static artifact verification on pushes and pull requests using Node 24 and `npm ci`. E2E is configured for local execution and is not part of this initial CI job.

The workflow assumes this `interactive-au/` directory is the Git repository root. A local repository is initialized for the foundation commit, including the lockfile. No remote is configured and nothing is published. If retaining it as a subdirectory in another repository, move the workflow to that repository's root `.github/workflows/` and adjust its working directory and lockfile path.

## Scope

Application code lives in `src/app`, `src/components/device`, and `src/features/os`. The five architectural boundaries remain intact; other implementation folders are added when requested. Zustand holds only transient OS navigation. Motion provides presentational gestures and transitions; navigation never depends on animation completion. Zod remains installed for future story validation. No dependency was added in Phase 4.

The physical shell remains a Server Component with `children`, optional `wallpaper="aurora" | "midnight"`, and a generic `overlay` slot. It has no navigation state. The OS uses normal-size scrolling content and original CSS/SVG visuals. No real camera, flashlight, connectivity, battery, or OS APIs are accessed.

## Presentation configuration

Edit `src/features/os/experience-config.ts` to change the fixed `clock`, visible `date`, ISO `dateTime`, wallpaper variant, and placeholder icon metadata/order. Grid entries use `placement: "grid"`; the four dock entries use `placement: "dock"`. Keep IDs unique, names meaningful, and the time/date fields coherent. These are display placeholders, not the final story's app registry. Reload always returns to the Lock Screen; no state is saved locally and no live time is read.

Swipe is optional and restricted to the lower handle. Scrolling elsewhere remains native. Reduced motion removes large transforms while preserving both swipe recognition and button navigation. Motion constants and gesture distance rules are in `src/features/os/os-motion.ts`. Phase 5 requires a separate request.
