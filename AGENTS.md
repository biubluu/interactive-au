# Interactive AU Development Guidelines

## Project scope and current phase

This project is a reading experience for **one alternate-universe story**, presented through a fictional phone simulation in the browser. It is not a SaaS product, an authoring platform, or a system for multiple stories.

Phase 1 provides the project foundation. Phase 2 adds the responsive physical Device Shell. Phase 3 adds simulated lock/home screens and basic navigation to clearly identified app placeholders. Do not build real virtual app functionality, story runtime, persistence, advanced gestures, or elaborate spring animations until the relevant phase is requested. The final story and virtual app list are undecided; clearly label all temporary content **PLACEHOLDER**.

Primary technical decision document: [docs/architecture.md](docs/architecture.md).

Device geometry, safe areas, responsive rules, and asset policy: [docs/design-system.md](docs/design-system.md). Keep the shell as Server Components without application state, and do not scale future interactive content with a universal transform.

OS state belongs in `src/features/os`, never in the shell. Initial time/date must be deterministic; the current configuration intentionally uses a fixed placeholder clock without live time. Do not request camera, flashlight, network, battery, or OS permissions for simulated controls.

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
