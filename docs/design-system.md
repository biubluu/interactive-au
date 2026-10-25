# Device Shell and OS Design System

Status: Phase 4.2 Lock Screen refinement. Physical geometry is retained from Phase 2; passcode, scheduler, Home layout, and fullscreen apps retain Phase 4.1 behavior. This is a fictional browser-rendered device, not real iOS or native hardware.

## Device geometry

The portrait logical screen reference is **393 x 852 CSS pixels**, with aspect ratio `393 / 852`. These are design coordinates, not a universally transformed application canvas. Resting content renders at normal CSS sizes.

Geometry tokens remain in `src/components/device/device.css`, scoped to `.phone-shell`.

| Token | Framed | Compact | Purpose |
| --- | --- | --- | --- |
| `--device-reference-width` | 393 | 393 | Portrait reference |
| `--device-reference-height` | 852 | 852 | Portrait reference |
| `--device-bezel` | 9px | 5px | Chassis/glass separation |
| `--device-screen-radius` | 49px | 39px | Physical glass clipping |
| `--device-frame-radius` | Screen radius + bezel | Screen radius + bezel | Concentric chassis |
| `--device-island-width` | 31% | 31% | Island width relative to glass |
| `--device-island-height` | 35px | 35px | Cutout height |
| `--device-island-top` | 12px | 12px | Cutout offset |
| `--device-safe-top` | 66px | 66px | Fixed top content clearance |
| `--device-safe-bottom` | 28px | 28px | Fixed bottom content clearance |
| `--device-safe-inline` | 24px | `clamp(16px, 5vw, 24px)` | Content side inset |
| `--device-stage-space` | 88px | Not used | Vertical stage breathing room |

Framed width is the minimum of 411px, viewport width minus 64px, and the width derived from viewport height minus stage space and bezel. The screen keeps its portrait ratio. Chassis metal gradients, seam highlights, side buttons, and contact/ambient shadows remain unchanged. The decorative Dynamic Island stays centered with its original CSS camera lens.

## Composition and fullscreen windows

`PhoneShell` remains a Server Component accepting `children`, optional `wallpaper` (`aurora` or `midnight`), a generic `overlay`, and `contentPresentation` (`inset` by default, or `full`). It has no navigation, clock, PIN, story, or persistence state.

The OS uses full-glass composition. The shell's generic full content container has no inset/padding and clips without scrolling. OS scenes fill that area. Each scene provides an `.os-scene-content` viewport with fixed top/bottom safe-area insets and one horizontal content padding. That viewport scrolls independently; padding does not scroll away beneath the island.

An app window paints the whole glass with an opaque dark background. Its content uses the same safe-area viewport, without an inset floating card, additional rounded window clipping, or duplicate safe-area padding. This intentionally remains an empty demo window, not a real Camera, Maps, Browser, or other app. Status chrome stays above it, and returning Home restores the launching icon's focus.

The glass retains `overflow: clip` and a rounded `clip-path`, so neither focus restoration nor oversized/positioned descendants can move hardware or paint outside it. Virtual safe-area tokens are independent of the reader's native phone safe areas; do not replace them with native `env(safe-area-inset-*)` values or count them twice.

## Responsive presentation

- **Framed:** viewport width at least 600px and height above 540px. Center the complete chassis with height-aware sizing and consistent glass proportions.
- **Compact:** viewport width below 600px or height at most 540px. Use up to 440px width, 6px minimum outer spacing, a 5px bezel, and glass height derived from dynamic viewport height. Hide decorative side buttons.
- **Short landscape:** keep compact presentation and native vertical scrolling inside the active safe-area viewport. Do not rotate or scale the interface.
- Use `svh` as fallback and `dvh` for mobile chrome changes. No JavaScript layout measurements run during initial rendering.
- There is no fixed minimum width. Portrait Home retains four columns. Names remain on one line and truncate with ellipsis when necessary, while full names remain accessible.
- Enlarged text and effective 200% zoom may require scrolling. Controls remain reachable; the status bar, island, and home indicator remain fixed.

## Typography, artwork, and wallpaper

The platform font stack is `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`. Apple devices can use their native font naturally. No Apple font files are bundled, downloaded, or redistributed.

The original CSS wallpaper remains available as `aurora` (rose/lavender ellipses and dark blue depth) or `midnight` (a hue/saturation/brightness variant). Each layer identifies its own fallback variant so a Home choice cannot alter the Lock image. App windows retain their opaque full-glass background.

Configure independent wallpaper choices in `src/features/os/experience-config.ts`:

```ts
lockScreen: {
  wallpaper: {
    image: "/wallpapers/lock-screen.jpg",
    position: "50% 50%",
    fallback: "aurora",
  },
  clockColor: "#ffffff",
  dateColor: "#ffffff",
},
homeWallpaper: { position: "50% 50%", fallback: "aurora" },
```

The image belongs at `public/wallpapers/lock-screen.jpg`. The current photograph is user-supplied; it was copied unmodified from the initially supplied `public/wallpaper/lock-screen.jpg` and is now stored at the requested plural path. No replacement image was sourced. Set a different local `image` path or omit it to use only CSS. `position` accepts normal CSS object-position values such as `50% 35%` to tune the crop. Home may independently specify a local image, position, and CSS fallback. Passcode follows the Lock wallpaper.

The decorative image fills the entire glass, including behind status chrome and the island. It uses cover rendering, never stretching, with physical rounded clipping unchanged. Next Image uses `fill`, preload, async decoding, and static-compatible `unoptimized` rendering. The supplied JPEG is approximately 221 KiB; no larger generated asset or external request is introduced. Absolute positioning reserves no layout space, and CSS remains beneath the image while it loads. An image error removes the failed image and exposes only the configured CSS artwork.

`src/features/os/app-artwork.tsx` contains original local SVG app illustrations: layered paper/calendar, a colorful photo mosaic, a metallic camera/lens, a road map, filled music/phone/message symbols, a shaded folder, a gear assembly, an envelope, and a compass. CSS controls rounded-square clipping, highlights, and shadows. Typed metadata selects artwork and base colors. Illustrative calendar markings are artwork, not a functional calendar app.

`os-icons.tsx` retains small line symbols for OS controls only. No Apple artwork, third-party phone mockup, external font, remote image request, or graphics engine is used. Any future third-party asset needs a documented source and appropriate license before use.

The stage follows light/dark color preference, while the simulated glass has a consistent palette. Normal reader presentation contains no PLACEHOLDER banners, repeated prototype subtitles, or verbose simulated-action notices. Demo/placeholder status remains explicit in source comments and developer documentation.

## Lock Screen and shortcuts

The Lock clock uses system weight 850 (within the 800–900 target), centered tabular numerals, restrained negative tracking, and container-aware sizing. A container-width cap keeps all HH:mm combinations on one line on small/enlarged-text screens. No proprietary font file is bundled. The date is abbreviated as **Sun 25 Oct** using the same WIB clock source. The small lock symbol is removed and date/clock spacing is reduced.

Clock and date colors are independent configuration values, both white by default. A restrained two-layer text shadow supports contrast on bright areas; the former full-screen Lock scrim is removed so the photograph remains visible. Review contrast for each chosen image/crop and select darker configured text when needed. No separate reference screenshot was attached for this phase, so proportions follow the written brief.

Flashlight and camera-style circles remain 52px, symmetrically positioned at the lower corners. Idle surfaces have a semi-transparent tint, fine translucent border, internal highlights, and a soft contact shadow. Blur (12px) and saturation (1.25) are enabled only inside a backdrop-filter support query, including the WebKit property. Without support, a readable tinted circular surface remains. Blur is static, not animated; press feedback and visual-only toggles retain existing behavior.

The lower semantic swipe button is visually empty: no arrow, instruction, or redundant Unlock label. It retains a minimum 56px height, accessible name **Enter passcode**, and a visible keyboard focus outline. It is the same pointer/touch drag region and click/Enter/Space alternative, not a separate visible control.

The affordance supports touch/mouse drag as well as click, Enter, and Space. A completed swipe opens passcode entry rather than Home. Shortcut buttons only toggle visual pressed states; their accessible names identify them as visual-only controls. They request no hardware APIs or permissions and display no verbose notices.

The home indicator is a decorative 5px bottom pill. It is not itself a native gesture handler.

## Passcode simulation

Navigation is `LOCK -> PASSCODE -> HOME -> APP`. Cancel/Escape returns to Lock. Relock also returns to Lock.

The configured PIN is **0411**, including its leading zero, per the user's update. `simulationPin` references `DEFAULT_SIMULATION_PIN` in `os-store.ts` by default, eliminating conflicting literals. This publicly shipped value is a storytelling mechanic, **not a security boundary**, credential, real authentication, encryption, account, or protected session. The validation algorithm and keypad behavior are unchanged.

Four circles show entered length without rendering the entered digits; a polite live region announces only the digit count. The large numeric keypad supports touch, mouse, physical number keys, Backspace/Delete, and Cancel/Escape. Correct four-digit entry opens Home immediately. Incorrect entry clears the circles and provides restrained error text/announcement plus a small shake; reduced motion removes the shake. Cancel, success, and relock remove digits from typed navigation state. Nothing is persisted.

Focus moves to the passcode heading on entry, to the accessible Home heading after success, and back to the swipe affordance after cancel/relock. Key events are scoped to the active passcode panel. Numeric auto-repeat is ignored.

## Shared live WIB clock

`WibClockProvider` supplies the same clock value to Lock Screen and status chrome. Server rendering and hydration use the deterministic `--:--` / WIB fallback and do not read the device time or browser APIs.

After mount, the provider starts one scheduler. `Intl.DateTimeFormat` explicitly uses `timeZone: "Asia/Jakarta"`; HH:mm uses 24-hour `h23` formatting, including 00:00 at midnight. A fixed English formatter supplies short weekday, numeric day, and short month, assembled as `Sun 25 Oct` without punctuation. The date uses the same WIB day. Only date presentation changed in Phase 4.2; the scheduler is untouched.

An initial client tick replaces the fallback. Each later timeout targets the next minute boundary, avoiding per-second rerenders. Returning to a visible tab refreshes immediately and reschedules the timer. Cleanup removes timers/listeners. Time comes from the browser device clock, so incorrect device time remains possible; no server/external time API is involved.

## Motion and gestures

The shared spring remains stiffness 380, damping 36, mass 0.85. Transforms and opacity provide transient motion; resting scene scale is 1. Wallpaper and backdrop blur are static.

| Interaction | Default | Reduced motion |
| --- | --- | --- |
| Drag affordance | Lock panel follows pointer with linked opacity | Recognize gesture without large displacement |
| Incomplete/cancelled drag | Spring back | Immediate reset |
| Lock to passcode | Lock lifts/fades; keypad settles in | Immediate change |
| Correct PIN to Home | Home settles in | Immediate change |
| Incorrect PIN | Restrained circle shake | Error announcement only |
| Open/close app | Expand/contract using approximate icon origin | Immediate change |
| Relock | Lock settles downward; outgoing scene recedes | Immediate change |
| Icon/shortcut press | Subtle scale | Opacity feedback |

Only the lower affordance has `touch-action: none`; native scrolling elsewhere remains available. Drag recognition starts after 10px. Unlock distance is 18% of the lock panel height, clamped to 72–120px, and upward travel must exceed 1.4 times horizontal travel. Short, diagonal, cancelled, or blur-interrupted drags do not advance. A moved drag cannot become a button click on release.

Zustand navigation updates immediately. Animation completion never gates navigation or future story progress. Exiting scenes are inert, aria-hidden, non-interactive, and excluded from active layout height. Revived scenes and focus restoration retain Phase 4 interruption behavior. Icon rectangles are measured only on launch to approximate the transform origin.

Reduced-motion preference uses the existing hydration-safe external-store hook, and updates when preferences change. Motion references: [drag controls](https://motion.dev/docs/react-use-drag-controls), [presence transitions](https://motion.dev/docs/react-animate-presence).

## Verification and screenshots

Build before E2E: tests use the actual `out/` static export on port 4173. The viewport matrix covers 320x568, 375x667, 393x852, 430x932, 768x1024, 1366x768, 1920x1080, and 852x393 landscape. Eight duplicate mobile matrix cases and one desktop copy of the mobile-only CDP touch test are deliberately skipped.

Tests cover PIN correctness/error/deletion/cancel/relock, physical keyboard support, live WIB formatting/midnight/visibility, shared status/lock time, hydration diagnostics, fullscreen bounds, rounded clipping, safe areas, overflow, accessibility, gesture cancellation, rapid transitions, reduced motion, and focus restoration. Axe checks all four scenes in both surroundings.

Zoom tests use an effective 683x384 CSS viewport plus 200% root text sizing. This is a reflow/enlarged-text approximation, not manual browser-menu zoom. Touch uses Chromium CDP input, not a physical device. Safari, native browser chrome behavior, and real-device animation feel remain manual-review limitations.

Current screenshots are ignored local artifacts at `artifacts/phase-4.2/`. Tests freeze device time to 09:41 WIB for stable visual review while production uses live time. Each viewport generates `lock-<width>x<height>.png`, `passcode-<width>x<height>.png`, `home-<width>x<height>.png`, and `app-<width>x<height>.png`. Explicit photo screenshots at 393x852, 430x932, and 1366x768 include the project name in `lock-photo-<width>x<height>-<project>.png`. Dark variants and enlarged-text Home screenshots are also generated. Earlier phase screenshots remain historical artifacts.

Phase 4.2 adds tests for local image bounds and cover cropping, missing-image fallback without layout shift, independent Home choice, no visible unlock instruction, shortcut symmetry/keyboard access, and all 24 hours on 320px width before and after 200% text sizing. The existing swipe, passcode, reduced-motion, accessibility, and fullscreen tests remain in use.

Phase 5 is not included.
