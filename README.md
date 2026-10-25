# Interactive AU

Phase 4.1 adds an iOS-inspired passcode flow, a shared live WIB clock, detailed original app artwork, and fullscreen demo windows. The experience opens locked. Swipe upward or activate the swipe affordance to enter the four-digit passcode, then explore Home and return from demo windows. Real virtual apps, story runtime, persistence, and Phase 5 are not implemented.

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

Playwright starts and stops the static preview server automatically on port 4173, keeping the default development server on port 3000 separate. Port 4173 must be free. Tests run against desktop and mobile Chromium, exercising passcode correctness/error/deletion/cancel/relock, physical keyboard input, fullscreen app layout, WIB midnight/visibility updates, hydration diagnostics, focus restoration, shortcuts, viewport fit, reduced motion, physical clipping, and axe checks. Browser downloads require network access. Additional browser engines are outside this phase.

The viewport matrix runs once in the desktop project; eight duplicate matrix cases are intentionally skipped in the mobile project. The CDP touch test runs only in mobile Chromium, so one desktop copy is also intentionally skipped. Current lock/passcode/home/fullscreen-app screenshots are generated in `artifacts/phase-4.1/` (ignored by Git), including mobile, tablet, desktop, landscape, dark surroundings, and enlarged text. Screenshot tests fix the device time at 09:41 WIB; production uses live device time. Gesture, rapid navigation, press feedback, and reduced-motion regressions remain covered. See [docs/design-system.md](docs/design-system.md) for geometry, motion, screenshot naming, and zoom-test limitations.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type checking, unit tests, production build, and static artifact verification on pushes and pull requests using Node 24 and `npm ci`. E2E is configured for local execution and is not part of this initial CI job.

The workflow assumes this `interactive-au/` directory is the Git repository root. A local repository is initialized for the foundation commit, including the lockfile. No remote is configured and nothing is published. If retaining it as a subdirectory in another repository, move the workflow to that repository's root `.github/workflows/` and adjust its working directory and lockfile path.

## Scope

Application code lives in `src/app`, `src/components/device`, and `src/features/os`. The five architectural boundaries remain intact; other implementation folders are added when requested. Zustand holds only transient OS navigation and entered passcode digits. Motion remains presentational; navigation never depends on animation completion. Zod remains installed for future story validation. Phase 4.1 adds no dependencies.

The physical shell remains a Server Component with `children`, optional `wallpaper="aurora" | "midnight"`, a generic `overlay`, and `contentPresentation="inset" | "full"`. It has no navigation or clock state. The OS uses full-glass scenes with independent safe-area scroll viewports and original CSS/SVG visuals. Typography uses native system fonts without bundled proprietary font files. No real camera, flashlight, connectivity, battery, or OS permission APIs are accessed.

## Presentation configuration

Edit `src/features/os/experience-config.ts` to change `simulationPin`, wallpaper variant, and demo icon metadata/order. Grid entries use `placement: "grid"`; the four dock entries use `placement: "dock"`. Keep IDs unique and names meaningful. Artwork is selected by the typed `icon` field and maintained locally in `app-artwork.tsx`. This is display configuration, not the final story's app registry. Demo status is documented in source/docs without prototype banners in normal reader UI.

The default PIN is **1111**. It is public storytelling simulation data, **not authentication or a security boundary**. Entered digits are masked by circles and exist only in the passcode view. Correct entry, cancel, and relock discard them; nothing is persisted. Physical number keys, Backspace/Delete, Escape, and the visible keypad are supported.

Clock time comes from the browser device clock, formatted in `Asia/Jakarta` with 24-hour HH:mm. SSR/hydration use a stable fallback, then one shared provider starts minute-boundary updates and refreshes on visibility. No external time API is used. Incorrect device clocks remain possible.

Swipe is optional and restricted to the lower affordance, which is also the keyboard/click unlock action. Scrolling elsewhere remains native. Reduced motion removes large transforms while preserving input. Motion constants remain in `src/features/os/os-motion.ts`. The Next.js development indicator is disabled through `devIndicators: false`; diagnostics remain enabled. Phase 5 requires a separate request.
