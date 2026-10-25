import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { simulationPin } from "./helpers";

test("glass styling and inward shortcut symmetry hold across compact, framed, and landscape", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-25T02:41:00Z"));
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }, { width: 1366, height: 768 }, { width: 852, height: 393 }]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("lock-clock")).toHaveText("11.11");
    await expect(page.getByTestId("status-clock")).toHaveText("11.11");
    const clock = page.locator(".os-clock");
    await expect(clock).toHaveCSS("opacity", "1");
    await expect(page.getByTestId("lock-clock")).toHaveCSS("opacity", "1");
    expect(await page.getByTestId("lock-clock").evaluate((element) => getComputedStyle(element).textShadow)).not.toBe("none");
    const inset = await page.locator(".os-shortcuts").evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft));
    expect(inset).toBeGreaterThanOrEqual(16);
    const left = await page.getByRole("button", { name: "Flashlight shortcut (visual only)", exact: true }).boundingBox();
    const right = await page.getByRole("button", { name: "Camera shortcut (visual only)", exact: true }).boundingBox();
    const glass = await page.getByTestId("device-screen").boundingBox();
    const swipe = await page.getByTestId("unlock-gesture").boundingBox();
    if (!left || !right || !glass || !swipe) throw new Error("Missing control geometry");
    expect(Math.abs(left.y - right.y)).toBeLessThan(1);
    expect(Math.abs(left.x - glass.x - (glass.x + glass.width - right.x - right.width))).toBeLessThan(1);
    expect(left.width).toBeGreaterThanOrEqual(44);
    expect(left.height).toBeGreaterThanOrEqual(44);
    expect(swipe.x).toBeGreaterThanOrEqual(left.x + left.width + 8);
    expect(swipe.x + swipe.width).toBeLessThanOrEqual(right.x - 8);
    expect(swipe.width).toBeGreaterThanOrEqual(44);
    expect(swipe.height).toBeGreaterThanOrEqual(44);
    const indicator = await page.locator(".os-home-indicator").boundingBox();
    if (!indicator) throw new Error("Missing home indicator");
    const visibleGap = indicator.y - (left.y + left.height);
    expect(visibleGap).toBeGreaterThanOrEqual(24);
    expect(visibleGap).toBeLessThanOrEqual(36);
    expect(swipe.y + swipe.height).toBeLessThan(indicator.y);
    const dateText = page.locator(".os-date time");
    await expect(dateText).toHaveCSS("padding", "0px");
    await expect(dateText).toHaveCSS("border-radius", "0px");
    await expect(dateText).toHaveCSS("border-top-width", "0px");
    await expect(dateText).toHaveCSS("box-shadow", "none");
    await expect(dateText).toHaveCSS("backdrop-filter", "none");
    await expect(dateText).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(dateText).toHaveCSS("background-clip", "text");
    const date = await dateText.boundingBox();
    if (!date) throw new Error("Missing date surface");
    expect(date.width).toBeLessThan(glass.width * 0.6);
    await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
    const key = page.getByRole("button", { name: "1", exact: true });
    const box = await key.boundingBox();
    if (!box) throw new Error("Missing numeric key");
    expect(box.height).toBeGreaterThanOrEqual(52);
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
    await expect(key).toHaveCSS("border-top-style", "solid");
    const blur = await key.evaluate((element) => getComputedStyle(element).backdropFilter);
    expect(blur).toContain("blur(12px)");
    await page.keyboard.type(simulationPin);
    await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("solid text and tinted surfaces remain readable and operable without glass filters", async ({ page }) => {
  await page.goto("/");
  // Force the documented fallback appearance on a modern browser; this does not
  // claim to emulate an older browser's CSS parser.
  await page.addStyleTag({ content: `
    :is(.os-shortcut, .os-pin-key) {
      -webkit-backdrop-filter: none !important; backdrop-filter: none !important;
      background: #2023349c !important;
    }
    :is(.os-clock, .os-date) time {
      background: none !important; color: var(--lock-text-color) !important;
      -webkit-text-fill-color: var(--lock-text-color) !important;
    }
  ` });
  expect(await page.getByTestId("lock-clock").evaluate((element) => getComputedStyle(element).color)).toBe(
    await page.locator(".os-clock").evaluate((element) => getComputedStyle(element).color)
  );
  const flashlight = page.getByRole("button", { name: "Flashlight shortcut (visual only)", exact: true });
  await expect(flashlight).toHaveCSS("backdrop-filter", "none");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await expect(page.getByRole("button", { name: "1", exact: true })).toHaveCSS("backdrop-filter", "none");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.type(simulationPin);
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
});
