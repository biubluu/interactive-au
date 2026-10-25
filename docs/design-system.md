# Device Shell Design System

Status: Phase 2. This document describes a fictional browser-rendered device, not real iOS hardware or OS behavior.

## Reference and geometry

The logical portrait screen reference is **393 x 852 CSS pixels**, an aspect ratio of `393 / 852` (approximately 0.4613). These are design coordinates, not a fixed application canvas. Children render at normal CSS text and control sizes; no universal transform scales the application.

Geometry tokens live in `src/components/device/device.css`, scoped to `.phone-shell`. The framed screen uses `aspect-ratio`; the outer chassis includes the bezel on both sides.

| Custom property | Framed | Compact | Purpose |
| --- | --- | --- | --- |
| `--device-reference-width` | 393 | 393 | Portrait reference width |
| `--device-reference-height` | 852 | 852 | Portrait reference height |
| `--device-bezel` | 9px | 5px | Dark rim and metal chassis thickness |
| `--device-screen-radius` | 49px | 39px | Rounded glass clipping boundary |
| `--device-frame-radius` | Screen radius + bezel | Screen radius + bezel | Concentric chassis curve |
| `--device-island-width` | 31% of screen | 31% of screen | Centered island width |
| `--device-island-height` | 35px | 35px | Hardware cutout height |
| `--device-island-top` | 12px | 12px | Offset from simulated glass top |
| `--device-safe-top` | 66px | 66px | Reserved content clearance below island |
| `--device-safe-bottom` | 28px | 28px | Bottom glass clearance |
| `--device-safe-inline` | 24px | `clamp(16px, 5vw, 24px)` | Content and focus-ring inset |
| `--device-stage-space` | 88px | Not used | Combined vertical breathing room |

The framed maximum is 411px wide: 393px of glass plus two 9px bezels. Width is the minimum of that maximum, viewport width minus 64px, and the width derived from available viewport height minus stage space. This preserves the portrait ratio and keeps the chassis inside the viewport. Small physical buttons extend 3px beyond the chassis and fit within the stage clearance.

The Dynamic Island is decorative, horizontally centered, non-interactive, and hidden from assistive technology. Its pill is black with a small CSS lens reflection at the right. It is not a notification system or OS control. Camera, side buttons, and wallpaper use no image assets.

## Components and composition

`PhoneShell` is the public Server Component. It accepts `children` and an optional typed `wallpaper` value (`aurora` or `midnight`). The frame and screen are simple markup inside it; separate exported components would add API surface without a current consumer. A private `DynamicIsland` component isolates the cutout markup.

The shell provides physical presentation only. The page owns the placeholder text, anchor, and target notice. The shell imports no stores, events, progress, OS navigation, or storage. Future OS content can be composed through `children` without changing this contract.

## Clipping and safe areas

The glass uses both `overflow: clip` and `clip-path: inset(0 round ...)`, together with its border radius. Unlike `overflow: hidden`, `overflow: clip` prevents browser focus restoration from scrolling the glass itself and displacing the island. Oversized or positioned descendants remain clipped at the rounded boundary.

`.device-content` is the only internal scrolling viewport. Its top and bottom are inset by the virtual safe-area tokens, with inline padding and scroll padding for visible focus outlines. Unlike padding inside a full-height scroller, these insets keep scrolling text out of the island area. The island is a sibling above the content layer, so scrolling never changes its physical position. Long content, landscape presentation, and enlarged text remain reachable through ordinary scrolling and keyboard focus.

Safe-area values are **virtual device** geometry, not readings from the user's actual phone. Do not substitute native `env(safe-area-inset-*)` values for these tokens or count the island clearance twice. Future OS screens should use these inherited tokens for fixed controls and scroll padding, and coordinate any full-bleed composition explicitly. This phase adds neither a status bar nor a home indicator.

## Responsive presentation

- **Framed:** viewport width is at least 600px and height exceeds 540px. The entire chassis is centered in a full-height stage, with a fixed screen ratio and height-aware width. Fonts and controls retain their CSS sizes even when the glass becomes narrower.
- **Compact:** viewport width is below 600px **or** height is at most 540px. The shell is up to 440px wide, with 6px minimum outer spacing on each side. Glass height follows available viewport height, subtracting outer space and bezel. The screen ratio adapts to the viewport to preserve usable space. Side buttons are hidden and chassis depth simplified.
- **Short landscape:** uses compact presentation, centered horizontally. Content scrolls inside the screen when it exceeds the available height; the device is not rotated and content is not scaled down.
- `svh` provides the fallback declaration; `dvh` follows changing mobile browser chrome. No JavaScript viewport measurement is needed during rendering.
- There is no fixed minimum width. Long text may wrap, the page must not overflow horizontally, and the entry control remains at least 48px high.
- Browser zoom naturally selects presentation based on the effective CSS viewport. Large text can scroll vertically rather than forcing a smaller font. Do not use `deviceScaleFactor` as a substitute for browser zoom testing.

## Visual treatment

The chassis is graphite with layered metal gradients, inset hairlines, a dark glass seam, and soft contact/ambient shadows. Decorative side controls add a recognizable hardware silhouette in framed presentation. Rounded glass and the island supply the main hardware cues without copying logos or proprietary mockups.

The surrounding stage follows `prefers-color-scheme`: a quiet mineral background in light mode and charcoal in dark mode. Chassis highlights remain visible against both. The display retains its own consistent dark palette. The composition has no animation, so reduced motion has no alternate timing or transition to manage.

The placeholder wallpaper is an original CSS composition: overlapping elliptical forms, lavender and rose highlights, and deep blue shadows with a dark lower scrim for text legibility. `wallpaper="midnight"` changes its hue, saturation, and brightness through CSS. Changing wallpaper does not change application state or access local data.

All temporary demo content sits under a visible **PLACEHOLDER / DEVICE STUDY** label; the entry target repeats **PLACEHOLDER** and explains that no story has started. The entry remains the native anchor from Phase 1. Wallpaper and hardware decoration are not read by assistive technology.

## Asset policy

No external assets, fonts, Apple artwork, or phone mockup libraries are used. The CSS artwork is authored in this repository. Any future local asset must have its source and license documented before use. Screenshot artifacts show only this project's original placeholder design.

## Verification and screenshot review

Run `npm run build` before `npm run test:e2e`: Playwright tests the actual `out/` export using the existing preview command. The viewport matrix covers 320x568, 375x667, 393x852, 430x932, 768x1024, 1366x768, 1920x1080, and 852x393 landscape. The matrix runs once in the desktop Chromium project; duplicate matrix cases in the mobile project are intentionally skipped. Existing mobile-project tests continue to cover touch-context entry behavior.

Tests inspect geometric relationships, centered island placement, normal-size entry targets, reachable placeholder content, horizontal overflow, and an oversized descendant's hit testing at rounded corners. They do not compare font rasterization or require pixel-perfect screenshot matching. Axe checks WCAG A/AA rules in both surrounding color schemes; automated checks do not replace a manual accessibility audit.

Zoom coverage uses a 683x384 CSS viewport (the reflow space of 1366x768 at 200%) and additional 200% root text sizing. It verifies content remains scrollable and the island remains fixed. This is an automated reflow/enlarged-text approximation, not a manual test of the browser's zoom menu. Native Safari, browser chrome transitions, and physical-device behavior still need later review.

Screenshots are written to ignored local artifacts in `artifacts/phase-2/`. Re-run E2E to regenerate them. Representative files:

- `device-320x568-light.png`
- `device-393x852-light.png`
- `device-768x1024-light.png`
- `device-1366x768-light.png`
- `device-1920x1080-light.png`
- `device-852x393-light.png`
- `device-desktop-chromium-dark.png`
- `device-mobile-chromium-dark.png`
- `device-zoom-desktop-chromium.png`

No Phase 3 OS behavior is included.
