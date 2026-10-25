# Interactive AU Architecture

Status: Phase 4 OS motion, gestures, and visual refinement built on the Phase 3 lock/home simulation. The five boundaries remain authoritative. Virtual app functionality, story runtime, and persistence remain planned.

## Product goals and boundaries

Interactive AU is an interactive storytelling website for one alternate-universe story. Readers experience the story inside a fictional phone simulation, with a premium, mobile-first design inspired by modern iOS 27. This is a visual direction, not an implementation of real iOS.

The final story and virtual app list are undecided. Mark every example or temporary piece of content **PLACEHOLDER**. Do not assume specific characters, plot points, apps, or authoring features are product requirements.

The MVP has no authentication, backend, database, CMS, external API, telemetry, or access to native phone data. The project does not provide a platform for multiple stories, an editor, a plugin system, or cross-device synchronization.

## Technology decisions

| Area | Decision | Rationale |
| --- | --- | --- |
| Framework | Next.js App Router and React | Clear page structure and component composition |
| Types | Strict TypeScript, without `any` | Protect module contracts and input validation |
| Styling | Tailwind CSS | Responsive layouts and consistent styling |
| Animation | Motion for React (`motion/react`) | Interactive transitions with reduced motion support |
| State | Zustand with separate, small stores | Separate temporary UI state from story progress |
| Validation | Zod | Validate story content and local data at runtime |
| Unit tests | Vitest | Test story logic and the persistence adapter |
| E2E | Playwright | Verify reader flows, keyboard use, and progress recovery |
| Distribution | Next.js static export | Hosting without a server runtime |

Dependencies are installed at stable releases and saved with exact versions in `package.json`; `package-lock.json` pins the full dependency graph. Use `npm ci` for reproducible installation. Node 24 is the recommended baseline in `.nvmrc` and CI; the local validation environment may use a newer supported Node release.

## Five responsibility boundaries

| Layer | Responsibility | Boundary |
| --- | --- | --- |
| Device Shell | Device frame, responsive sizing, clipping, visual safe areas | Does not know about story events, the active app, or persistence |
| OS Simulation | Lock screen, home screen, active app, navigation, transitions, focus | Does not execute story rules or write to storage |
| Virtual Apps | Present app experiences using typed data and actions | Do not modify other apps' internal stores or read storage directly |
| Story Runtime | Evaluate and execute events, flags, and progress | Does not import React, DOM, Motion, or browser storage |
| Persistence | Read, validate, and save non-sensitive progress | Does not store UI state or determine story outcomes |

The composition root connects these five parts. Device Shell receives content through composition. The OS uses the registry to render apps. Apps receive data and actions through small contracts; apps do not import each other. The runtime receives events and progress, then produces the next progress state deterministically. The persistence adapter receives a validated progress snapshot.

## Planned source structure

```text
src/
  app/                   # App Router entry and composition root
  components/device/     # Device Shell
  features/os/           # OS Simulation and UI state
  features/apps/         # Explicit registry and Virtual Apps modules
  story/                 # Schema, content, runtime, and progress state
  persistence/           # Progress storage adapter
tests/
  unit/                  # Domain behavior and persistence tests
  e2e/                   # User flows against the static export
```

This structure guides module boundaries. Do not create empty folders or extra abstractions simply to match the diagram.

## App registry

Use a static, typed registry to map stable app IDs to metadata and app components. The app list remains undecided. The registry is an explicit declaration in code; there is no plugin discovery, network registration, or dynamic import based on user input.

The OS controls opening and closing apps. Each app uses only the story data it needs and the runtime actions provided to it. Story references to app IDs must be checked against the registry before the reader experience begins.

## UI state and story progress

UI state is temporary: lock status, home screen or active app, open panels, and transitions. It lives in a small UI store and is not persisted in the MVP.

Story progress has a separate store: story identity/revision, schema-defined flags, processed event IDs, and reader position where required by the story. Do not add progress fields before their behavior is defined. Story content remains static local data, separate from progress.

Action flow: reader interaction -> typed action -> runtime validation of event prerequisites -> next progress state -> progress store update -> snapshot persistence. UI changes follow runtime results through explicit contracts; components do not modify flags directly.

Events have stable IDs and explicit ordering/prerequisite rules. Completed events must not apply progress effects twice. Use ordinary functions and typed branches for event types actually needed; do not build a scripting language or a general-purpose state machine. Real-time schedules, complex branching, and time-based offline behavior remain undecided.

## Validation and persistence

Zod validates content structure and the progress envelope. Additional checks validate unique IDs and references between events/apps. Once a pipeline exists, invalid content must be caught by build/test checks rather than only when a reader reaches the affected event.

Use a `localStorage` adapter for non-sensitive progress only. The envelope includes a persistence schema version and story identity/revision so incompatible data can be recognized. Do not store credentials, personal identity information, native data, or device history.

Read storage after mount, validate it as `unknown`, and finish recovery before enabling automatic writes. This prevents saved progress from being overwritten by initial state. Corrupt data or unsupported versions must not crash the application: use initial progress in memory and display a brief notice. Do not silently assume old data is compatible or immediately delete it when reading fails. Add explicit migrations only when needed.

Handle storage access and write failures; the experience continues in memory with a notice that progress is not being saved. A progress reset, if requested later, deletes only this project's key. Persistence is not guaranteed to be available in every browser and does not offer cross-device synchronization.

## Static hosting and hydration

During implementation, use `output: 'export'` and generate static assets through the build. All story content and assets must be available locally. Avoid API routes, Server Actions, server cookies, middleware that requires a server, and other features requiring a server runtime. Dynamic routes, if needed, must be known at build time. If using `next/image`, configure it for static hosting compatibility.

Keep initial markup identical on the server and in the browser. Do not read `window`, `localStorage`, local time, viewport dimensions through JavaScript, or random values during the initial render. Use responsive CSS for layout; initialize browser-dependent behavior after mount. Render a deterministic recovery state until progress has been read. Place Client Component boundaries only where interactivity requires them.

## Accessibility, visuals, and security

Use semantic HTML elements and native buttons for controls. All primary actions must support keyboard use, accessible names, visible focus, and adequate touch targets. Manage focus when opening/closing apps; modal overlays trap focus only while active. Provide alternative controls for gestures. Device clipping must not hide essential controls on small screens or when zoomed.

Respect `prefers-reduced-motion`, including in Motion configuration. Use minimal transitions for that preference. Animation completion must not be the sole trigger for progress or access to controls.

Use original or appropriately licensed assets and document sources and licenses when adding them. Avoid HTML injection, `eval`, secrets, and external network requests. All temporary text must visibly appear as **PLACEHOLDER** in the reader experience, not only in code comments.

## Verification strategy

- Vitest: content schema, invalid IDs/references, event rules and prerequisites, prevention of duplicate effects, separation of progress from UI state, recovery from corrupt/incompatible data, and storage failures.
- Playwright: lock/home/app flows once implemented, keyboard navigation and focus, progress recovery after reload, mobile/desktop viewports, and reduced motion. Run against the static export to verify hosting boundaries.
- Implementation checks: TypeScript, lint, unit tests, and build; E2E according to the change scope. Use actual scripts once a manifest exists.
- Documentation phase: check content, relative links, and boundary consistency; application tests are unnecessary.

Tests follow implemented behavior. Do not create tests for speculative UI or features during this phase.

## Phase 1 decisions and status

- Phase 1 introduced only `src/app`. Unimplemented layers have no empty folders, stores, schemas, registry, or runtime abstractions.
- The landing page and layout are Server Components rendered at build time. The native `Enter Experience` anchor targets a focusable, clearly labeled placeholder notice on the same page. It does not start a story or persist state.
- Tailwind is configured through its PostCSS integration. The page uses local system fonts, no external assets, and no animations, so reduced motion requires no client-side behavior in this phase.
- Motion, Zustand, and Zod are installed for their documented future responsibilities. They are intentionally unused until those responsibilities are implemented.
- Static export uses `output: 'export'` and trailing slashes. Vite, already used by Vitest, is an explicit development dependency for its static preview command serving `out/`; production hosting needs only the exported files. Do not use `next start` for this project.
- ESLint uses maintained ESLint 10 with JavaScript, TypeScript, and the official Next.js Core Web Vitals plugin rules, and rejects explicit `any`. The full `eslint-config-next` preset is not used because its current React/import/accessibility plugins declare incompatible ESLint peer ranges. Browser tests cover the current keyboard entry behavior; broader React/accessibility lint rules should be revisited before interactive UI is added. Type checking runs Next.js type generation before TypeScript so a clean checkout can be checked before a build.
- Vitest runs foundation unit tests in Node without a simulated browser. Playwright tests the actual static export in desktop and mobile Chromium, including keyboard navigation and reduced motion. No speculative story tests are added.
- GitHub Actions runs lint, type checking, unit tests, production build, and static artifact checks. The workflow assumes `interactive-au` is the repository root. E2E remains an explicit local command in this phase.

## Phase 2 decisions

- `src/components/device/phone-shell.tsx` provides a Server Component that composes children inside decorative chassis, glass, and a private Dynamic Island component. Frame and screen markup remain internal rather than becoming unnecessary component APIs.
- The shell has no state and imports no OS, story, app registry, or persistence modules. The landing page owns all placeholder content and retains the Phase 1 anchor/focus contract.
- CSS tokens define device geometry. Framed presentation preserves the 393x852 glass ratio; compact presentation adapts glass height to the dynamic viewport and scrolls content without scaling fonts or controls. The glass clips without becoming a scroll container, keeping hardware fixed while content scrolls.
- [design-system.md](design-system.md) records geometry, virtual safe areas, wallpaper options, responsive rules, and visual decisions. There are no external images, fonts, phone mockup packages, or runtime graphics dependencies.
- React Hooks linting uses stable `eslint-plugin-react-hooks` 7.1.1, whose peer range supports ESLint 10. The incompatible JSX accessibility plugin is not forced into the dependency graph; `@axe-core/playwright` adds actual rendered-page accessibility checks in light/dark surroundings, alongside keyboard tests. These are browser checks, not accessibility lint rules or a complete manual audit.
- Existing scripts and CI remain unchanged. Additional E2E tests cover requested viewports, landscape, rounded clipping, focus reachability, and enlarged-text reflow, and generate local screenshots. No OS state or speculative story tests are added.

## Phase 3 decisions

- `src/features/os` owns the lock/home presentation, simulated status indicators, shortcut feedback, placeholder app metadata, and navigation. The initial screen is the Lock Screen, replacing the previous landing page. The old landing-specific tests were updated to the requested initial experience; static rendering, keyboard/focus, clipping, responsive layout, and reduced-motion coverage are retained.
- `OsExperience` is a Client Component with one Zustand vanilla store created per mount. A small discriminated view union represents lock, home, or a generic app placeholder. UI state is transient, isolated between instances, and resets to lock on reload. There is no persisted reader progress or shared mutable server store.
- Every placeholder icon opens the same OS-owned informational view using its configured name/icon. Returning home restores focus to the launching icon; unlock focuses the home heading; relock focuses the unlock control. These views are not real Virtual Apps and do not establish the final app registry or story requirements.
- `PhoneShell` remains a Server Component without OS imports or state. Its new generic `overlay` composition slot accepts OS-owned status chrome and a decorative home indicator. Geometry, clipping, and the safe-area scrolling viewport remain unchanged. The overlay is pointer-transparent and lies below the physical island.
- `experience-config.ts` is trusted, typed local presentation configuration for wallpaper, fixed clock/date, and placeholder icon order/placement. Time remains fixed at 9:41 with an explicit ISO placeholder date. No browser clock, timers, connectivity, battery, camera, media, or flashlight APIs are used. First server render and hydration use the same data.
- Shortcut buttons only update local visual feedback and an accessible status announcement. Flashlight has an `aria-pressed` state; the camera shortcut reports a simulated preview notice. Neither requests permissions or opens native functionality.
- Original SVG line art supplies app and control symbols. No dependencies or runtime asset requests were added. Navigation is immediate; advanced gestures and spring transitions remain reserved for Phase 4.
- Playwright now uses static-preview port 4173 to avoid interfering with the user's dev server on port 3000. Existing npm scripts, build configuration, dependency versions, and CI remain unchanged. E2E covers deterministic startup, relocking/reload, focus restoration, simulated shortcuts, all required viewports, indicator clearance, both color schemes, and enlarged-text reflow.

## Phase 4 decisions

- OS motion uses the already-installed Motion for React package; no dependencies, shell geometry, hosting configuration, npm scripts, or CI changes are needed. `LockScreen` owns its gesture and simulated shortcut feedback. `OsScene` owns presentational transitions and focus on entry. `OsExperience` continues composing views from the Zustand navigation state.
- The Zustand view remains the single source of navigation truth. Actions are guarded and repeated lock/unlock/open/home requests are idempotent. Navigation updates immediately and never depends on animation completion. Local launch metadata stores only the last icon ID and normalized transform origin for presentation and focus restoration.
- `AnimatePresence` uses simultaneous entry/exit. Exiting scenes become inert, aria-hidden, non-interactive, and absolutely positioned so they do not determine the active layout height. Their test IDs are removed. The active scene receives focus immediately; return-home restores the launching icon. A scene revived during an interrupted exit resumes safely, and a revived Lock Screen resets drag displacement.
- Dragging begins only on the lower, explicitly marked gesture surface through `useDragControls` with automatic listeners disabled. A Motion value drives vertical displacement and linked opacity without React state updates per pointer move. Release requires a bounded, viewport-relative upward distance and a predominantly vertical direction; short/diagonal/downward motion cancels. Touch cancellation and browser blur reset the gesture. Velocity alone never unlocks.
- Native scrolling remains available outside the swipe surface. Only that surface uses `touch-action: none`; the native unlock button remains separate. Reduced motion keeps gesture recognition but removes its large visual displacement and uses immediate scene changes with opacity-only press feedback.
- `useOsReducedMotion` uses React's external-store hydration contract: a deterministic server snapshot is reused for hydration, then the media preference is synchronized and observed for changes. MotionConfig receives the synchronized policy. No matchMedia reads occur during server rendering, and fixed time/date remain unchanged.
- Home Screen has a visually hidden accessible heading and one small visible PLACEHOLDER marker. Repeated icon subtitles and the dock caption are removed; full placeholder names remain on every button. Labels stay on one line with ellipsis only when necessary, retaining complete accessible names and hover titles. Motion changes only transient visual transforms/opacity, not responsive application sizing.
- Tests retain the Phase 3 behavior and shell checks and add continuous mouse drag, touch input/cancellation, invalid gesture starts, spring-back, blur cancellation, rapid/interrupted navigation, icon press/origin, reduced-motion hydration and preference changes, and narrow/landscape layout. Screenshots are generated under `artifacts/phase-4/`.

The story and final app list remain open product decisions. Phase 5 must be requested separately; it is not started automatically.

Project documentation is written in English. User-facing progress updates and completion reports are written in Indonesian.
