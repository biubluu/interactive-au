import { expect, test } from "@playwright/test";
import { enterPasscode } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-25T02:41:00Z"));
});

test("local wallpaper covers the glass, crops naturally, and Home remains independent", async ({ page }, testInfo) => {
  for (const viewport of [{ width: 393, height: 852 }, { width: 430, height: 932 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const image = page.locator(".os-wallpaper-image");
    await expect(image).toHaveAttribute("src", /\/wallpapers\/lock-screen\.jpg$/);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-fit", "cover");
    await expect(image).toHaveCSS("object-position", "50% 50%");
    const screen = await page.getByTestId("device-screen").boundingBox();
    const photo = await image.boundingBox();
    if (!screen || !photo) throw new Error("Missing wallpaper geometry");
    expect(Math.abs(photo.width - screen.width)).toBeLessThan(1);
    expect(Math.abs(photo.height - screen.height)).toBeLessThan(1);
    expect(Math.abs(photo.x - screen.x)).toBeLessThan(1);
    expect(Math.abs(photo.y - screen.y)).toBeLessThan(1);
    // The differing aspect ratios require cover cropping, not stretching.
    const ratio = await image.evaluate((element: HTMLImageElement) => element.naturalWidth / element.naturalHeight);
    expect(Math.abs(ratio - screen.width / screen.height)).toBeGreaterThan(0.05);
    await expect(page.locator(".os-date")).toHaveText("Sun 25 Oct");
    await expect(page.getByTestId("unlock-gesture")).toHaveText("");
    await expect(page.locator(".os-lock-symbol")).toHaveCount(0);
    await expect(page.getByText("Swipe up to unlock")).toHaveCount(0);
    await page.screenshot({ path: `artifacts/phase-4.2/lock-photo-${viewport.width}x${viewport.height}-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
    await expect(image).toHaveCount(1);
    await enterPasscode(page);
    await expect(image).toHaveCount(0);
    await expect(page.getByTestId("os-wallpaper")).toHaveAttribute("data-fallback", "aurora");
  }
});

test("a missing image gracefully reveals CSS without moving the device", async ({ page }) => {
  await page.route("**/wallpapers/lock-screen.jpg", (route) => route.abort("failed"));
  await page.goto("/");
  const before = await page.getByTestId("device-frame").boundingBox();
  await expect(page.locator(".os-wallpaper-image")).toHaveCount(0);
  await expect(page.getByTestId("os-wallpaper").locator(".device-wallpaper")).toBeVisible();
  const after = await page.getByTestId("device-frame").boundingBox();
  expect(after).toEqual(before);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Enter Passcode", exact: true })).toBeFocused();
  await enterPasscode(page);
});

test("all 24 hour combinations fit the narrow clock, including enlarged text", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator(".os-clock")).toHaveCSS("font-weight", "850");
  for (const enlarged of [false, true]) {
    if (enlarged) await page.addStyleTag({ content: "html { font-size: 200%; }" });
    for (let hour = 0; hour < 24; hour += 1) {
      await page.clock.setFixedTime(new Date(Date.UTC(2026, 9, 25, hour, 59)));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(page.getByTestId("lock-clock")).toHaveText(`${String((hour + 7) % 24).padStart(2, "0")}:59`);
      expect(await page.locator(".os-clock").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("glass shortcuts remain symmetric, accessible, and clear of the invisible swipe button", async ({ page }) => {
  await page.goto("/");
  const flashlight = page.getByRole("button", { name: "Flashlight shortcut (visual only)", exact: true });
  const camera = page.getByRole("button", { name: "Camera shortcut (visual only)", exact: true });
  const left = await flashlight.boundingBox();
  const right = await camera.boundingBox();
  const swipe = await page.getByTestId("unlock-gesture").boundingBox();
  const glass = await page.getByTestId("device-screen").boundingBox();
  if (!left || !right || !swipe || !glass) throw new Error("Missing control geometry");
  expect(left.height).toBeGreaterThanOrEqual(44);
  expect(right.height).toBeGreaterThanOrEqual(44);
  expect(Math.abs(left.y - right.y)).toBeLessThan(1);
  expect(Math.abs((left.x - glass.x) - (glass.x + glass.width - right.x - right.width))).toBeLessThan(1);
  expect(swipe.y).toBeGreaterThanOrEqual(left.y + left.height);
  await page.keyboard.press("Tab");
  await expect(flashlight).toBeFocused();
  await page.keyboard.press("Space");
  await expect(flashlight).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await expect(camera).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("unlock-gesture")).toBeFocused();
  await expect(page.getByTestId("unlock-gesture")).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await enterPasscode(page);
});
