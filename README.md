# Interactive AU

Phase 5.5 presents eleven provisional iPhone-inspired application identities with local original artwork and a clean Home Screen without a visible relock control. Notes remains the only functional app, with session-only edits and the Phase 5.4 glass/keyboard UI preserved. The fictional 11.11 / Tue 17 Nov 2026 timeline, PIN 0411, shared sunset wallpaper, shell geometry, and OS gestures remain unchanged. Phase 6 is not implemented.

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


## Phase 5.4: selected local UI icons and Notes toolbar

Framework7 Icons **5.0.5**, pinned in the manifest/lockfile, is the only added dependency. It is MIT-licensed (Vladimir Kharlampidi); see THIRD-PARTY-NOTICES.md and https://framework7.io/icons/. These are third-party iOS-inspired assets, not official Apple symbols or fonts. Only selected SVG path data enters the application bundle: scripts/generate-ui-icons.mjs extracts explicit package assets into src/components/ui-icon-data.ts. Run `node scripts/generate-ui-icons.mjs` after an intentional package/mapping change. No icon font, CDN, runtime discovery, arbitrary import, or full Framework7 framework is used.

UiIcon uses semantic typed names and inline currentColor SVGs hidden from assistive technology. Back, ellipsis, compose, checkmark, share, search, table, attachment, pencil, link, left alignment, and Lock camera use verified package assets. There is no font-loading blank state. NotesIcon retains original checklist and circled-A artwork because the package has no sufficiently matching checklist/circled-A glyph. Highlight combines the package pencil with a simple underline. The original flashlight remains: substituting a lightbulb would be conceptually incorrect. Original keyboard modifiers remain to preserve approved keycap proportions; status symbols, relock control, and all colored Home illustrations are unchanged.

The exact toolbar order is Aa, checklist, table, attachment, circled A, bold, italic, underline, strikethrough, underlined pencil, link, alignment. Plain typography implements the letter symbols. All twelve formatting controls remain honestly disabled; the text model stays plain text. One rounded native horizontal scroll region hides its scrollbar without widening the app. It is focusable and supports ArrowLeft/ArrowRight/Home/End, touch and trackpad scrolling. Vertical page scrolling is not blocked; reduced motion disables smooth scrolling. OS Home gestures remain outside this region.

Title/body focus and taps activate the existing simulated keyboard. Dedicated keyboard/native buttons are removed from the formatting row. The editor ellipsis opens text-entry options with explicit native and simulated modes; the keyboard globe also opens native entry. Native fallback preserves editable textarea/IME/paste behavior. inputMode none remains a browser hint, not a guarantee of software-keyboard suppression. Keyboard geometry, editing callbacks, caret behavior, session-only data/reset policy, fixed 17 November 2026 timeline, PIN, wallpaper, and OS navigation are unchanged.

Local tests and screenshots are intentionally Git-ignored. Phase 5.4 screenshots are in artifacts/phase-5.4/. Physical-device native keyboard suppression, non-Chromium rendering, and manual assistive-technology review remain unverified. No Phase 6 or Story Runtime is introduced.


Phase 5.4 local verification: `npm run lint`, `npm run type-check`, `npm test` (78 tests in 10 files), and `npm run build` passed. Static artifacts out/index.html, out/404.html, and out/_next/static were verified; no icon font was emitted. Full Playwright Chromium run: 86 passed, 12 intentionally skipped across desktop/mobile projects, including axe checks. Selected SVG source is 12,361 bytes (4,380 bytes gzip; source-size measurement, not a whole-route bundle delta). Screenshot dimensions were checked and rendered compose/Done/Lock glyphs, toolbar start/end, narrow/mobile and desktop layouts reviewed. Forty-eight local screenshots are under artifacts/phase-5.4/. Ignored local development files remain untracked.


### Phase 5.4 addendum: icon weight and toolbar rhythm

The original flashlight outline occupied a narrow optical area beside the filled Framework7 camera. It is now an original filled silhouette with rounded cap/handle and a negative-space switch. The unchanged 25px SVG boxes remain centered inside the same 52px glass controls; no shortcut positioning, clock, wallpaper, or gesture token changes.

Framework7 wifi and battery_100 are verified installed glyphs and included by the existing explicit SVG generator. Status-specific viewBoxes remove excess square-artboard whitespace without changing vendor paths. Existing status placement, island geometry, stacking, and pointer transparency are unchanged. Original cellular artwork now uses four rounded filled SVG bars on a common baseline: the library's bars glyph is a horizontal menu and is unsuitable. All three use currentColor for white photo chrome and dark app chrome, with no real hardware queries. Old CSS battery/HTML bar constructions are removed.

Toolbar slots change from 44px plus 2px gap (46px pitch) to 40px with no inter-slot gap; vertical targets remain 44px. Inner typography uses explicit 22px alignment boxes and an 18px system font rather than browser-dependent letter metrics. Container padding is 6px. All twelve actions remain disabled and in the approved order. Native horizontal scrolling, keyboard arrows/Home/End, hidden scrollbar, editor-triggered keyboard, and contextual native-input fallback are unchanged. No new dependency, keyboard redesign, data model change, or Phase 6 work is introduced.

Addendum screenshots use distinct *-refined.png filenames under artifacts/phase-5.4/ and do not replace prior captures. They document rendered proportions, not pixel-perfect fidelity or physical-device behavior.


Addendum verification: lint, TypeScript, 80 Vitest tests, production static-export build, and static artifact checks passed. Full Chromium regression: 86 passed, 13 configuration skips, one mobile eight-scene axe test exceeded its 30-second timeout. The same test passed separately with one worker and a 60-second limit (23.2-second test duration), with no axe violations; the original timeout is retained in this report. Ten distinct refined PNGs were dimension-checked and visually inspected, including status contrast, shortcut pair, toolbar start/middle/end, and 320/393/430 viewport layouts. Existing uncommitted work and ignored local development paths remain preserved; no commit or push was performed.


Phase 5.4 shared glass controls live in `src/components/glass-controls.css`, loaded by the root layout. Floating utility controls reuse neutral/photo/accent tokens rather than app-specific opaque surfaces. Notes Compose/Search are neutral; Done alone uses translucent gold. Local AGENTS/design-system documentation defines the permanent Shared Glass Controls Contract. Notes remains session-only and Phase 6 is unimplemented.


Shared-glass verification: lint, TypeScript, 80 unit tests in 10 files, production build, and out/index.html/out/404.html/out/_next/static checks passed. Relevant Chromium regression (seven selected test files): 60 passed, 4 context-specific skips. The older screenshot-producing create/legacy/layout cases were excluded to preserve their artifacts; equivalent reload/session and layout behavior is covered by the new glass test and existing noncapturing regressions. The updated screenshot-only review test also passed separately. Axe checks passed for Notes/editor, photo/keypad fallbacks, and forced no-blur Notes. Current requested glass-*.png captures were dimension-checked and visually reviewed, including 320/375/393/430, desktop, and landscape. The 333x52 Lock shortcut crop has zero differing pixels against its pre-extraction capture in this environment. This proves local reference preservation, not pixel-perfect iOS reproduction. Physical Safari/Firefox and actual unsupported CSS engines remain unverified; the fallback is forced in Chromium. No commit/push or tracking-policy change.

Phase 5.4 Notes bottom controls float independently above the scrolling list. Their positioning wrapper is unpainted and pointer-transparent between controls; shared glass styles remain on Search/Compose only. Scroll clearance derives from the actual control band. See local design-system guidance for the permanent floating-container rule.

Verification for the transparent-bottom addendum: lint, TypeScript, 80 unit tests, production build, and static export artifact checks passed. Six selected regression files completed with 59 passes and 3 desktop/touch-specific skips; prior screenshot-producing cases were excluded to preserve their artifacts. The new floating-bottom test passed in both desktop and mobile Chromium, including axe, computed no-paint/pseudo-element checks, gap hit-testing to the underlying list, actual row/control overlap, mouse/touch/keyboard compose actions, last-row keyboard access, and Home focus restoration. Layouts checked: 320x568, 375x667, 393x852, 430x932, and desktop 1366x768. Distinct notes-floating-bottom*.png review captures include an intentionally intermediate scroll position showing a note behind the controls. Physical devices/non-Chromium engines remain unverified. No commit, push, tracking-policy change, or next-phase work.

## Phase 5.5: provisional Home identities and local app artwork

The approved provisional roster is Calendar, Photos, Camera, Notes, X, Apple Music, Settings, Phone, Messages, and Safari. The first four grid slots are unchanged; X replaces Maps, Files is removed, and Settings follows Music. The dock retains Phone/Messages and the stable browser ID (displayed as Safari); Mail is removed. Three equal dock columns accommodate the three actual entries without filler or duplicates. Tile size, four-column Home grid, dock material, wallpaper, clipping, status chrome, and launch motion remain. The author edited the Music label to Apple Music during implementation; that preference is preserved. `music.identity` explicitly records Apple Music: AppMus never means a separate service. No playback or other new app functionality exists.

The registry still contains only Notes. Other configured launch IDs open the existing informational view, with normal OS Home and focus restoration. Removing the visible relock button also removes its Home header space and unused control CSS/import; there is no hidden replacement or shortcut. The guarded store lock action and its unit/cancel tests remain intact. Reload still starts at Lock and PIN 0411 is required. Browser regressions now assert absence of the removed control; internal relocking is tested at the store boundary.

`public/app-icons/` contains ten original 128x128 full-bleed SVGs and their MIT license. `scripts/generate-app-icons.mjs` is the maintained artwork source, not a runtime icon engine. It derives Calendar's Tuesday/17 from the explicit timeline, never the device clock. New designs use a green solid speech bubble/handset, Notes paper/yellow band, colored Photos petals, detailed gray camera lens/gears, a blue graduated Safari compass, geometric black X, and a rose/white Apple Music-inspired paired-note motif. These are original visual alternatives, not official Apple/X assets or a claim of trademark permission. Each SVG has a square background with no pre-rounded outer mask or transparent padding; only the existing OS tile rounds it. SVG is resolution-independent and requires no new dependency/font. The ten files total approximately 24KB before transport compression.

`app-icon-assets.ts` is a small typed artwork mapping, not another app registry. AppArtwork uses local Next Image with explicit dimensions, decorative alt/aria semantics and unoptimized static loading. If an asset fails, the retained original inline artwork renders instead; Calendar's legacy fallback also shows Tuesday 17. Removed-app fallback drawings remain private legacy code, not visible extra launchers. The same mapping serves grid, dock, and informational views.

### Asset source review and limits

The requested SysAdminDoc/iOSIconPack gallery, README, contribution conventions and MIT license were inspected. Ten iOS18 PNG candidates were downloaded only into ignored source-review artifacts: each is 192x192 with full-canvas alpha bounds. The inspected Calendar shows 1, and the file labeled Settings depicts stacked shapes, not the requested gear. The published MIT repository license alone does not establish a clear independent provenance chain for each branded raster. None is shipped. Icons8's inspected iOS page emphasizes outline glyphs; free website use requires visible attribution. No Icons8 art is bundled, purchased, or downloaded into public assets. References: https://github.com/SysAdminDoc/iOSIconPack, https://sysadmindoc.github.io/iOSIconPack/, https://icons8.com/icons/ios, https://icons8.com/license. Source review is not a claim that either provider's assets are universally unlicensed.

All ten shipped SVGs instead use project-original geometry, with source/license recorded in public/app-icons/LICENSE.txt. This avoids presenting an unknown third-party image as officially licensed. Intentional limitations: close iPhone-inspired identities rather than exact proprietary icon reproductions. Standard Framework7 UI glyphs and glass controls remain a separate design category and are not replaced by these tiles.

To replace a provisional icon, verify permission/provenance first, update its one mapping/file or maintained generator, retain square full-bleed art and decorative semantics, update notices, run asset/navigation tests, and compare actual-size grid/dock/contact-sheet screenshots. Do not register another app simply because artwork exists. No story runtime or Phase 6 is implemented.

Phase 5.5 verification: npm run lint, npm run type-check, npm test (83 tests in 11 files), npm run build, static entry/404/static-directory checks, and exported ten-SVG byte/hash comparisons passed. Full Playwright Chromium run: 95 passed and 15 intentional context-specific skips (110 cases, 60-second CLI timeout). Final expanded Home-specific run: 7 passed and 1 matrix skip, including 150% root text and aspect-ratio/reachability checks. Axe passed on Home and existing scenes/Notes. The missing-image test intentionally aborts one local asset to confirm the original fallback. No unexpected external icon requests or failures occurred in normal roster tests.

Sixteen top-level review PNGs under artifacts/phase-5.5/ include all twelve required filenames, a 600x240 equal-size contact sheet, 768x1024/1920x1080 views, and a second short-landscape Dock view. Dimensions and rendered identity/centering/crop were inspected. Short landscape uses existing native scene scrolling; the additional Dock capture demonstrates reachability, rather than shrinking the shell or typography. Legacy screenshot-producing tests write into artifacts/phase-5.5/regression so prior phase captures remain intact. Source-review PNGs are ignored diagnostic material only, not exported artwork. Safari/Firefox, physical device feel, and manual screen-reader review remain unverified. No claim of exact official iOS asset reproduction is made.

Created: public/app-icons/{x,messages,phone,notes,camera,photos,music,safari,calendar,settings}.svg and LICENSE.txt; scripts/generate-app-icons.mjs; src/components/app-icon-assets.ts; local tests/unit/app-icons.test.ts and tests/e2e/home-icons.spec.ts. Modified: app-artwork.tsx, experience-config.ts, os-experience.tsx, os.css, os-icons.tsx (legacy union compatibility), README, THIRD-PARTY-NOTICES, local architecture/design-system/AGENTS, and existing local E2E expectations/artifact paths. No source files were deleted. No dependency, tracking policy, commit, push, Notes data model, or Phase 6 change. Existing uncommitted Phase 5.4 work and the author's Apple Music display-name edit are preserved.

## Phase 5.5 addendum: Instagram, licensed Settings, and author-corrected four-app Dock

The author's follow-up supersedes the initial five-app Dock request: Safari belongs in the main grid. Final row-major grid: Calendar, Notes, X, Instagram, Apple Music, Settings, Safari. Final Dock, in order: Phone, Messages, Photos, Camera. There are eleven unique launch IDs, no duplicated Photos/Camera, and no relock UI. Safari retains the stable browser ID. Only Notes is registered/functional; Instagram and all other candidates use informational placeholders.

Instagram is original project SVG artwork with a warm/purple gradient and white rounded camera motif, under the directory's project MIT grant. Settings now uses the existing framework7-icons 5.0.5 gear.svg geometry on a project silver tile. This replaces the manually generated radial turbine/teeth; the vendor path is reused unchanged with uniform scaling, not distorted or sharpened. The installed gear/gear_alt options and prior local pack candidates were inspected. No new dependency or random Apple raster is shipped. Settings is a composite and public/app-icons/LICENSE.txt now includes the complete Framework7 copyright/MIT notice. The project license covers original portions; the source glyph retains its attribution. No separate new Settings reference screenshot was actually attached to this addendum, so no pixel-perfect reference claim is made.

The four-column Dock restores the original 12px horizontal gaps and 12px side padding, with a 94px minimum material height and existing 15px vertical padding. Each launcher retains at least 44x44px hit bounds. Actual icon size follows available column width, capped at 62px with one rounded mask. Dock radius, light translucent material, external placement, safe areas, and Home Indicator remain unchanged. Short displays retain native scene scrolling.

Generator source and the typed artwork mapping include Instagram; all previous original assets, including the approved Apple Music artwork and label, remain intact. Standard UI icons, glass controls, Notes content/session behavior, keyboard, wallpapers, PIN 0411, and the fixed 2026 timeline are unchanged. Existing user edits to notes-model.ts remain untouched. No Phase 5.6/6 work, commit, push, tracking-policy change, or forced addition of local files.

Final four-Dock addendum verification: lint, strict TypeScript, 84 unit tests in 11 files, production build, static export entries, and exact source/export matches for all eleven SVGs passed. Full final Chromium regression: 98 passed, 16 context/matrix skips across 114 cases (two workers, 60-second CLI timeout). The earlier in-progress five-Dock run was stopped when the author changed the requested layout; it is not reported as a completed verification run. The final tests assert the exact seven/four roster, no duplicates/relock, 44px minimum touch and image widths at eight viewport sizes, no dock clipping/indicator overlap, normal and enlarged text, all eleven mouse/keyboard/touch launch/focus flows, Notes editing/session/reset, and axe checks. User-edited notes-model.ts retains its original captured SHA256.

Current review screenshots: home-instagram-settings-four-dock-393x852.png, home-four-app-dock-{320x568,375x667,393x852,430x932}.png, home-four-app-dock-desktop.png, settings-icon-refined-closeup.png, instagram-icon-closeup.png under artifacts/phase-5.5/. Earlier five-Dock captures remain as historical review artifacts; four-Dock filenames represent the approved latest request. Screenshot dimensions/materials/spacing were visually reviewed. Settings reference matching remains limited by the absent additional attachment; physical devices and non-Chromium engines are unverified. No automatic commit/push, forced add, state architecture change, or Phase 5.6/6 implementation.
