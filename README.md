# Interactive AU

Phase 5.3 provides light-mode Notes with temporary page-session edits, consistent surfaces, clean white action icons, and a refined simulated keyboard. Full reload restores dated story samples. Lock/Home wallpaper, the fictional 11.11 / Tue 17 Nov 2026 clock, PIN 0411, geometry, and OS gestures remain unchanged. No Phase 6 work is included.

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

Playwright starts and stops the static preview server automatically on port 4173, keeping the default development server on port 3000 separate. Port 4173 must be free. Tests run against desktop and mobile Chromium, exercising passcode correctness/error/deletion/cancel/relock, physical keyboard input, fullscreen app layout, fixed timestamp stability across timezones/visibility, hydration diagnostics, focus restoration, shortcuts, viewport fit, reduced motion, physical clipping, and axe checks. Browser downloads require network access. Additional browser engines are outside this phase.

The viewport matrix runs once in the desktop project; eight duplicate matrix cases are intentionally skipped in the mobile project. The CDP touch test runs only in mobile Chromium, so one desktop copy is also intentionally skipped. Current screenshots are generated in `artifacts/phase-4.4/` (ignored by Git), including explicit Lock photo review at 393x852, 430x932, and 1366x768. Production and screenshots use the same fixed fictional story clock. Gesture, rapid navigation, reduced motion, cropping/fallback, and fixed narrow clock regressions are covered. See [docs/design-system.md](docs/design-system.md) for details and review limitations.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type checking, production build, and static artifact verification on pushes and pull requests using Node 24 and `npm ci`. E2E is configured for local execution and is not part of this initial CI job.

The workflow assumes this `interactive-au/` directory is the Git repository root. A local repository is initialized for the foundation commit, including the lockfile. This cleanup does not commit or publish changes. If retaining it as a subdirectory in another repository, move the workflow to that repository's root `.github/workflows/` and adjust its working directory and lockfile path.

## Scope

Application code lives in `src/app`, `src/components`, `src/features/os`, and `src/features/apps`. The five architectural boundaries remain intact; other implementation folders are added when requested. Zustand holds only transient OS navigation and entered passcode digits. Motion remains presentational; navigation never depends on animation completion. Zod remains installed for future story validation. Phase 5 adds no dependencies.

The physical shell remains a Server Component with `children`, optional `wallpaper="aurora" | "midnight"`, a generic `overlay`, and `contentPresentation="inset" | "full"`. It has no navigation or clock state. The OS uses full-glass scenes with independent safe-area scroll viewports and original CSS/SVG visuals. Typography uses native system fonts without bundled proprietary font files. No real camera, flashlight, connectivity, battery, or OS permission APIs are accessed.

## Presentation configuration

Edit `src/features/os/experience-config.ts` to configure `lockScreen.wallpaper`, `homeWallpaper`, `lockScreen.clockColor`, and `lockScreen.dateColor`. The shared typed `sunsetWallpaper` has a local `image`, an adjustable `position` (`50% 50%`), and a CSS `fallback` (`aurora`). The default Lock image is `public/wallpapers/lock-screen.jpg`, using the unmodified user-supplied photograph. Missing images reveal CSS artwork; no unrelated image is substituted. Remove `image` to use CSS only. Lock/passcode and Home share the same image and crop.

Demo icon metadata/order remains configurable with grid/dock placement and typed artwork names. This is display configuration, not the final story's app registry. Placeholder content remains documented in source/docs without prototype banners in reader UI.

The PIN is **0411**, including the leading zero, per the user's update. Presentation configuration now references the store's `DEFAULT_SIMULATION_PIN` constant. It is public storytelling simulation data, **not authentication or a security boundary**. Entered digits are masked and transient; success, cancel, and relock discard them. Keypad behavior is unchanged.

Story time is configured in `experienceConfig.storyClock`: canonical `11:11`, displayed `11.11`, date `Tue 17 Nov`, date key `2026-11-17`, and ISO timestamp `2026-11-17T11:11:00+07:00`. One provider supplies identical SSR/hydration values to Lock Screen and status bar. It creates no clock timers or visibility listeners and reads no device time. This is fictional story time, unaffected by timezone, reload, or elapsed time.

Swipe is optional and restricted to the visually empty lower region, which is also the focusable keyboard/click action named Enter passcode. There is no visible arrow or unlock instruction. Scrolling elsewhere remains native. Reduced motion and motion constants are unchanged. The Next.js development indicator remains disabled; diagnostics remain enabled. Phase 6 requires a separate request.

## Registering virtual apps

See `src/features/apps/virtual-app.ts` and `registry.ts`. Each static definition has an ID, display name, typed original artwork reference, base color, and React component. Add an explicit import/definition, then add its typed ID to `experienceConfig.registeredApps`. Only Notes is registered today. Existing `experienceConfig.apps` entries remain visual placeholders with the same informational fallback; they are not silently registered implementations.

Apps own local internal navigation and focus, while the OS owns launching, closing, safe-area scrolling, Home gestures, and icon focus restoration. Notes opens its list on every launch. Committed Notes changes remain only in page-session memory; editor/keyboard state is local. Use the circular Notes list Back action or drag/click/keyboard-activate the transparent region around the bottom indicator. Home interaction is absent on lock/passcode and cannot bypass PIN entry.

New checks cover registry/invalid inputs, internal navigation, lifecycle, accessibility, a dedicated non-touch desktop mouse context, CDP touch Home swipes, and layout/scrolling. Current Notes screenshots are generated in `artifacts/phase-5.3/`. Existing Phase 4.4 regression checks remain active. Future candidates are documented in [docs/architecture.md](docs/architecture.md); none is implemented or final.

## Notes session and text entry

Compose, type, save with Done or Back, and reopen notes within the current page. A full reload intentionally restores the original three dated fictional samples. Unsaved drafts close with Home. Temporary Notes content is independent of future story progress. Old browser keys `interactive-au:notes:v1` and `interactive-au:notes:v2` are preserved but neither read nor written; the obsolete Notes storage/migration adapter is removed. No browser storage access is required for Notes.

The author-corrected reference stays `2026-11-17T11:11:00+07:00`, Asia/Jakarta. Seeds have explicit authored dates; no Date unavailable section appears. Previously, v1 imports were undated because no history was recorded. Their dates are not guessed retroactively.

Two native fields provide 22.5px/15px-equivalent title/body typography and serialize to plain text. Enter from title moves into body; empty-body Backspace returns to title. The reusable simulated keyboard supports caret/selection edits, numbers/symbols, Shift/caps, grapheme deletion, and physical keyboard input. Its globe and toolbar native-entry controls keep the textarea editable with `inputMode="text"`; native keyboard suppression remains browser-dependent. Selection across both fields remains unsupported.

Current screenshots are generated in `artifacts/phase-5.3/`: fresh/legacy lists, editor top, icon close-ups, keyboard, narrow/landscape, and desktop layouts. The scope adds no dependencies, backend, external integrations, new apps, or Story Runtime. Search/formatting/sharing remain disabled. Physical-device keyboards and Safari/Firefox remain unverified.

## Local-only development files

`/AGENTS.md`, `/docs/`, `/tests/`, and `/artifacts/` are ignored and excluded from the tracked repository. Existing local copies remain available for Codex, documentation, Vitest, and Playwright. Normal `git add .` does not stage them; an explicit `git add -f` can override ignore rules.

Fresh clones do not include these files. The test commands and dependencies remain in package.json for machines retaining the local tests; npm test and npm run test:e2e need that private tests folder. CI intentionally runs only lint, strict type checks, production build, and static-export artifact verification. It does not run tests that are not available in the clone. Back up these local-only files separately because future commits no longer back up their changes. Removing paths from the current tree does not remove copies from earlier Git history.
