# Interactive AU

Phase 4.3 refines the Lock Screen with HH.mm clock presentation, live abbreviated WIB dates, coordinated glass clock/date/keypad surfaces, and symmetric inward shortcuts. Local photo wallpaper and the invisible accessible swipe region remain intact. The existing passcode flow, live clock, Home layout, and fullscreen demos remain intact. Real virtual apps, story runtime, persistence, and Phase 5 are not implemented.

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

The viewport matrix runs once in the desktop project; eight duplicate matrix cases are intentionally skipped in the mobile project. The CDP touch test runs only in mobile Chromium, so one desktop copy is also intentionally skipped. Current screenshots are generated in `artifacts/phase-4.3/` (ignored by Git), including explicit Lock photo review at 393x852, 430x932, and 1366x768. Tests fix time at 09:41 WIB only for screenshots; production uses live device time. Gesture, rapid navigation, reduced motion, cropping/fallback, and all-hour narrow clock regressions are covered. See [docs/design-system.md](docs/design-system.md) for details and review limitations.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type checking, unit tests, production build, and static artifact verification on pushes and pull requests using Node 24 and `npm ci`. E2E is configured for local execution and is not part of this initial CI job.

The workflow assumes this `interactive-au/` directory is the Git repository root. A local repository is initialized for the foundation commit, including the lockfile. No remote is configured and nothing is published. If retaining it as a subdirectory in another repository, move the workflow to that repository's root `.github/workflows/` and adjust its working directory and lockfile path.

## Scope

Application code lives in `src/app`, `src/components/device`, and `src/features/os`. The five architectural boundaries remain intact; other implementation folders are added when requested. Zustand holds only transient OS navigation and entered passcode digits. Motion remains presentational; navigation never depends on animation completion. Zod remains installed for future story validation. Phase 4.1 adds no dependencies.

The physical shell remains a Server Component with `children`, optional `wallpaper="aurora" | "midnight"`, a generic `overlay`, and `contentPresentation="inset" | "full"`. It has no navigation or clock state. The OS uses full-glass scenes with independent safe-area scroll viewports and original CSS/SVG visuals. Typography uses native system fonts without bundled proprietary font files. No real camera, flashlight, connectivity, battery, or OS permission APIs are accessed.

## Presentation configuration

Edit `src/features/os/experience-config.ts` to configure `lockScreen.wallpaper`, `homeWallpaper`, `lockScreen.clockColor`, and `lockScreen.dateColor`. Each wallpaper has an optional local `image`, an adjustable `position` (default `50% 50%`), and a CSS `fallback` (`aurora` or `midnight`). The default Lock image is `public/wallpapers/lock-screen.jpg`, using the unmodified user-supplied photograph. Missing images reveal CSS artwork; no unrelated image is substituted. Remove `image` to use CSS only. Lock/passcode and Home choices are independent.

Demo icon metadata/order remains configurable with grid/dock placement and typed artwork names. This is display configuration, not the final story's app registry. Demo status remains in source/docs without prototype banners in reader UI.

The PIN is **0411**, including the leading zero, per the user's update. Presentation configuration now references the store's `DEFAULT_SIMULATION_PIN` constant. It is public storytelling simulation data, **not authentication or a security boundary**. Entered digits are masked and transient; success, cancel, and relock discard them. Keypad behavior is unchanged.

Clock time comes from the browser device clock, computed in `Asia/Jakarta` with canonical 24-hour HH:mm and displayed consistently as HH.mm. The same provider supplies the actual abbreviated English WIB date, including midnight and calendar rollovers. ISO attributes and spoken time labels retain their conventional formats. SSR/hydration use a stable fallback, then one shared provider starts minute-boundary updates and refreshes on visibility. No external time API is used. Incorrect device clocks remain possible.

Swipe is optional and restricted to the visually empty lower region, which is also the focusable keyboard/click action named Enter passcode. There is no visible arrow or unlock instruction. Scrolling elsewhere remains native. Reduced motion and motion constants are unchanged. The Next.js development indicator remains disabled; diagnostics remain enabled. Phase 5 requires a separate request.
