# Interactive AU Development Guidelines

## Project scope and current phase

This project is a reading experience for **one alternate-universe story**, presented through a fictional phone simulation in the browser. It is not a SaaS product, an authoring platform, or a system for multiple stories.

Phases 1–4.1 provide the foundation, Device Shell, OS motion, passcode, live WIB clock, and fullscreen demos. Phase 4.2 provides independent wallpapers and the invisible accessible gesture surface. Phase 4.3 refines clock/date presentation, glass surfaces, and symmetric shortcut spacing only. Keep the canonical HH:mm clock model separate from displayed HH.mm; retain live shared WIB dates and the existing scheduler. Do not start Phase 5 or build real virtual app functionality, story runtime, persistence, or unrelated product features. The final story and app list remain undecided. Identify demo content as **PLACEHOLDER** in source comments and developer documentation; do not show prototype labels in normal reader presentation.

Primary technical decision document: [docs/architecture.md](docs/architecture.md).

Device geometry, safe areas, responsive rules, and asset policy: [docs/design-system.md](docs/design-system.md). Keep the shell as Server Components without application state, and do not scale future interactive content with a universal transform.

OS state belongs in `src/features/os`, never in the shell. Initial time/date must be deterministic. One shared provider starts the live Asia/Jakarta clock only after hydration, schedules minute-boundary updates, refreshes on visibility, and cleans up timers/listeners. Do not request camera, flashlight, network, battery, or OS permissions for simulated controls.

Motion must remain presentational: update navigation immediately, never gate it on animation callbacks. Exiting scenes must be inert and hidden from assistive technology. The swipe affordance is also a semantic button; never make gestures the only unlock path. Keep native scrolling outside that surface and use the hydration-safe reduced-motion hook.

The configured four-digit PIN (default `0411`, including its leading zero) is public storytelling simulation data, not a credential or security boundary. Presentation configuration uses the same default constant as the store. Digits belong only to the typed passcode view, never to persistence. Correct entry, cancel, and relock must discard them. Keep the Device Shell state-free; full-glass composition is generic, while OS scenes own fixed safe-area scroll viewports.

Lock and Home wallpaper choices are independent local presentation configuration. Keep CSS fallbacks, cover cropping, adjustable positioning, and rounded clipping. Never replace a missing user image with unrelated imagery. The Lock Screen swipe button has an accessible name and visible keyboard focus but no visible instruction or arrow.

## Technology standards

- Use Next.js App Router, React, and TypeScript with `strict: true`.
- Use Tailwind CSS for layout and styling, Motion for React (`motion/react`) for animation, Zustand for minimal application state, and Zod for story data validation.
- Use Vitest for unit tests and Playwright for end-to-end tests.
- Choose stable, maintained, compatible dependency versions when implementation begins; record selected versions in the manifest and lockfile. Do not assume version compatibility.
- The MVP architecture must support static export. Do not add a server runtime, authentication, database, CMS, backend, or external API.

## Architecture boundaries

1. **Device Shell** handles only device appearance, sizing, clipping, and visual safe areas.
2. **OS Simulation** handles the lock screen, home screen, app navigation, and transitions.
3. **Virtual Apps** are isolated modules registered through an explicit, typed registry.
4. **Story Runtime** handles story events, flags, and reader progress without depending on UI rendering.
5. **Persistence** stores non-sensitive reader progress locally through an adapter that validates data.

Separate temporary UI state from persisted story progress. Do not access `localStorage` directly from components or story logic. The registry must not become a plugin system. Avoid complicated state machines, global event buses, speculative abstractions, and generalization for multiple stories.

## Implementation and security

- Avoid `any`; use explicit types at module boundaries and `unknown` for untrusted input.
- Validate story content and persistence data with Zod. Use stable IDs and reject unknown event or app references.
- Do not use `eval`, unsafe HTML injection, credentials, or secrets.
- Run the simulation entirely in the browser; do not attempt to run real iOS or read native phone data.
- Do not add telemetry or network integrations to the MVP. Use original assets or local assets with documented sources and licenses.
- Keep the initial render deterministic. Access browser APIs, local time, and persistence after mount or through user actions; do not use random values or the current time in initial markup.
- Limit Client Components to interactive parts. Do not use Next.js features that require a server in the static export.

## UX and accessibility

- Prioritize mobile screens while remaining responsive to touch, mouse, and keyboard input.
- Use semantic HTML, clear control names, visible focus, and a logical tab order.
- App navigation must manage and restore focus; gestures must not be the only way to perform an action.
- Respect `prefers-reduced-motion`; provide minimal transitions and keep story progress independent of animation.
- Modern iOS visual inspiration is a design direction, not a claim to run iOS or use Apple-owned assets.

## Workflow and verification

1. Inspect the repository, applicable instructions, and related code before making changes.
2. Implement only the requested phase, with the smallest change that meets the requirement.
3. Record architectural decisions and their rationale in `docs/architecture.md` when important boundaries or behavior change.
4. Add focused tests for important behavior: story validation, event execution, state separation, persistence recovery, and implemented navigation flows.
5. Once tooling is available, run type checks, lint, unit tests, the static export build, and relevant E2E tests using actual project scripts. Never invent script names or test results.
6. For documentation-only changes, check file existence, relative links, content consistency, and phase scope; application tests are unnecessary.
7. Write project documentation, including this file and `docs/architecture.md`, in English. Report to the user in Indonesian: changed files, checks actually executed and their results, limitations, and next steps. Clearly identify checks that could not be run.
