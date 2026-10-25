# Interactive AU Development Guidelines

## Project scope and current phase

This project is a reading experience for **one alternate-universe story**, presented through a fictional phone simulation in the browser. It is not a SaaS product, an authoring platform, or a system for multiple stories.

Phases 1–4.1 provide the foundation, Device Shell, OS motion, passcode, live WIB clock, and fullscreen demos. Phase 4.2 provides independent wallpapers and the invisible accessible gesture surface. Phase 4.3 refines clock/date presentation, glass surfaces, and symmetric shortcut spacing only. Keep the canonical HH:mm clock model separate from displayed HH.mm; Phase 4.4 supersedes live time with a fixed shared fictional timestamp from experience configuration (11:11, Sat 17 Nov 2029), displayed as 11.11. No device-clock reads, active clock timers, or visibility listeners are needed. Phase 5.3 keeps Notes as fictional page-session data, refines its light canvas/icons/keyboard, and preserves the approved OS. Notes no longer accesses browser storage; a full reload restores dated seeds. Historical v1/v2 browser data must remain untouched. Do not start Phase 6, implement other candidate apps, Story Runtime progress, or unrelated features. The final story and app list remain undecided. Registered app components own only local internal navigation; the OS owns launching, closing, focus restoration, and the bottom Home gesture. Identify demo content as **PLACEHOLDER** in source comments and developer documentation; do not show prototype labels in normal reader presentation.

Primary technical decision document: [docs/architecture.md](docs/architecture.md).

Device geometry, safe areas, responsive rules, and asset policy: [docs/design-system.md](docs/design-system.md). Keep the shell as Server Components without application state, and do not scale future interactive content with a universal transform.

OS state belongs in `src/features/os`, never in the shell. Initial time/date must be deterministic. One shared provider supplies the configured fixed story timestamp identically during SSR and hydration. The old live-clock utilities remain isolated and inactive. Do not request camera, flashlight, network, battery, or OS permissions for simulated controls.

Motion must remain presentational: update navigation immediately, never gate it on animation callbacks. Exiting scenes must be inert and hidden from assistive technology. The swipe affordance is also a semantic button; never make gestures the only unlock path. Keep native scrolling outside that surface and use the hydration-safe reduced-motion hook.

The configured four-digit PIN (default `0411`, including its leading zero) is public storytelling simulation data, not a credential or security boundary. Presentation configuration uses the same default constant as the store. Digits belong only to the typed passcode view, never to persistence. Correct entry, cancel, and relock must discard them. Keep the Device Shell state-free; full-glass composition is generic, while OS scenes own fixed safe-area scroll viewports.

Lock and Home share one typed local sunset wallpaper configuration; the approved Lock Screen styling is unchanged. Keep CSS fallbacks, cover cropping, adjustable positioning, and rounded clipping. Never replace a missing user image with unrelated imagery. The Lock Screen swipe button has an accessible name and visible keyboard focus but no visible instruction or arrow.

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
5. **Persistence** owns browser storage adapters. No active Notes persistence adapter remains; future Story Runtime progress stays separate and unimplemented.

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

Phase 5.1 input policy: Notes uses a native controlled textarea, a reusable callback-based virtual keyboard, and inputMode="none" by default. Keep native/hardware editing available through an explicit fallback. Keyboard suppression is browser-dependent, not guaranteed. Done and internal Back save; empty drafts create no record, and clearing a saved note removes it. OS Home discards only the unsaved draft. Browser storage must stay in the persistence adapter, be validated with Zod, and never be written before recovery. Corrupt or unsupported data must remain untouched while edits continue in session memory.

Phase 5.2 refines Notes only. Per the author's correction, the shared presentation timeline is 2026-11-17T11:11:00+07:00 in Asia/Jakarta: OS time remains 11.11 and date is Tue 17 Nov. The approved Lock styling/geometry remain unchanged. Notes v2 adds nullable historical timestamps, a stable edit sequence, and validated read-only v1 migration; never fabricate historical dates. Opening or committing unchanged text is strictly write-free. Title/body native controls serialize losslessly to plain text; virtual input follows the active field. Do not start Phase 6.

Phase 5.3 supersedes all earlier Notes storage/migration instructions: edits are temporary within the current page; closing/reopening Notes retains committed session changes, while full reload restores original dated story samples. Never read, update, delete, or migrate old Notes localStorage keys. Keep OS navigation/clock/PIN independent of this session state. Use one Notes canvas token across full-glass app/status/nav/editor regions, clean white action strokes without filters, and retain native input fallback and two-field text editing.
