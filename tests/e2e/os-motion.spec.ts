import { expect, test, type Locator, type Page } from "@playwright/test";
import { enterPasscode, openHome } from "./helpers";

async function position(surface: Locator) {
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  if (!box) throw new Error("Missing gesture surface");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function mouseSwipe(page: Page, surface: Locator, distance: number, horizontal = 0) {
  const start = await position(surface);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + horizontal, start.y - distance, { steps: 16 });
  await page.mouse.up();
}

async function displacement(panel: Locator) {
  return panel.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42);
}

test("mouse drag follows the pointer, cancels short swipes, then unlocks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const surface = page.getByTestId("unlock-gesture");
  const panel = page.getByTestId("lock-panel");
  const start = await position(surface);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y - 36, { steps: 8 });
  await expect.poll(() => displacement(panel)).toBeLessThan(-20);
  await page.mouse.up();
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await expect.poll(async () => Math.abs(await displacement(panel))).toBeLessThan(0.5);
  await mouseSwipe(page, surface, 160);
  await expect(page.getByRole("heading", { name: "Enter Passcode", exact: true })).toBeFocused();
  await enterPasscode(page);
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
});

test("real touch input cancels an incomplete swipe and unlocks with a longer swipe", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Real touch input runs on the mobile Chromium context.");
  await page.goto("/");
  const session = await page.context().newCDPSession(page);
  async function swipe(distance: number, cancel = false) {
    const start = await position(page.getByTestId("unlock-gesture"));
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, id: 1 }] });
    for (let step = 1; step <= 12; step += 1) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x, y: start.y - distance * step / 12, id: 1 }] });
    }
    await session.send("Input.dispatchTouchEvent", { type: cancel ? "touchCancel" : "touchEnd", touchPoints: [] });
  }
  await swipe(32);
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await expect.poll(async () => Math.abs(await displacement(page.getByTestId("lock-panel")))).toBeLessThan(0.5);
  await swipe(160, true);
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await expect.poll(async () => Math.abs(await displacement(page.getByTestId("lock-panel")))).toBeLessThan(0.5);
  await swipe(160);
  await expect(page.getByTestId("os-passcode")).toBeVisible();
  await enterPasscode(page);
  await expect(page.getByTestId("os-home")).toBeVisible();
  await session.detach();
});

test("taps, horizontal drags, and drags outside the lower handle never unlock", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByTestId("unlock-gesture").click();
  await expect(page.getByTestId("os-passcode")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await mouseSwipe(page, page.getByTestId("unlock-gesture"), 100, 140);
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await expect.poll(async () => Math.abs(await displacement(page.getByTestId("lock-panel")))).toBeLessThan(0.5);
  await mouseSwipe(page, page.locator(".os-clock"), 120);
  await expect(page.getByTestId("os-lock")).toBeVisible();
  expect(await page.getByTestId("unlock-gesture").evaluate((element) => getComputedStyle(element).touchAction)).toBe("none");
  expect(await page.getByTestId("device-content").evaluate((element) => getComputedStyle(element).touchAction)).toBe("auto");
});

test("rapid navigation is idempotent, exits are inert, and focus returns to the app icon", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter passcode", exact: true }).evaluate((button: HTMLButtonElement) => {
    for (let index = 0; index < 8; index += 1) button.click();
  });
  await expect(page.getByTestId("os-passcode")).toHaveCount(1);
  await enterPasscode(page);
  await expect(page.getByTestId("os-home")).toHaveCount(1);
  await page.getByRole("button", { name: "Open Notes" }).evaluate((button: HTMLButtonElement) => {
    for (let index = 0; index < 8; index += 1) button.click();
  });
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  const origin = await page.getByTestId("os-app").evaluate((element) => element.style.transformOrigin);
  expect(origin).toContain("%");
  expect(Number.parseFloat(origin)).toBeGreaterThan(50);
  expect(await page.locator(".os-scene[data-exiting='true']").evaluateAll((elements) => elements.every((element) =>
    element.hasAttribute("inert") && element.getAttribute("aria-hidden") === "true"))).toBe(true);
  await page.getByRole("button", { name: "Close Notes" }).evaluate((button: HTMLButtonElement) => {
    for (let index = 0; index < 8; index += 1) button.click();
  });
  await expect(page.getByRole("button", { name: "Open Notes" })).toBeFocused();
  await page.getByRole("button", { name: "Lock device" }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Enter passcode", exact: true }).evaluate((button: HTMLButtonElement) => button.click());
  await enterPasscode(page);
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
  await expect(page.locator(".os-scene[data-exiting='false']")).toHaveCount(1);
});

test("a swiped lock screen can be relocked immediately during its exit", async ({ page }) => {
  await page.goto("/");
  await mouseSwipe(page, page.getByTestId("unlock-gesture"), 160);
  await expect(page.getByTestId("os-passcode")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await expect.poll(async () => Math.abs(await displacement(page.getByTestId("lock-panel")))).toBeLessThan(0.5);
});

test("losing browser focus cancels a drag without unlocking", async ({ page }) => {
  await page.goto("/");
  const start = await position(page.getByTestId("unlock-gesture"));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y - 100, { steps: 12 });
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.mouse.up();
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await expect.poll(async () => Math.abs(await displacement(page.getByTestId("lock-panel")))).toBeLessThan(0.5);
});

test("reduced motion avoids scene transforms and retains button and swipe navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("os-lock")).toHaveAttribute("data-motion", "reduced");
  await mouseSwipe(page, page.getByTestId("unlock-gesture"), 160);
  await expect(page.getByTestId("os-passcode")).toHaveAttribute("data-motion", "reduced");
  await enterPasscode(page);
  await expect(page.getByTestId("os-home")).toHaveAttribute("data-motion", "reduced");
  const transform = await page.getByTestId("os-home").evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return [matrix.a, matrix.d, matrix.m41, matrix.m42];
  });
  expect(transform).toEqual([1, 1, 0, 0]);
  await page.getByRole("button", { name: "Open Notes" }).click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Close Notes" }).click();
  await expect(page.getByRole("button", { name: "Open Notes" })).toBeFocused();
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByTestId("os-home")).toHaveAttribute("data-motion", "full");
});

test("app icons give subtle press feedback before opening", async ({ page }) => {
  await page.goto("/");
  await openHome(page);
  const notes = page.getByRole("button", { name: "Open Notes" });
  const start = await position(notes);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await expect.poll(() => notes.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeLessThan(0.99);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
});

test("narrow and landscape layouts retain four columns, intact labels, and native scrolling", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 852, height: 393 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.mouse.wheel(0, 240);
    await expect(page.getByTestId("os-lock")).toBeVisible();
    await openHome(page);
    expect(await page.locator(".os-app-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4);
    const labels = await page.locator(".os-app-label").evaluateAll((elements) => elements.every((element) =>
      getComputedStyle(element).whiteSpace === "nowrap"));
    expect(labels).toBe(true);
    await expect(page.getByTestId("os-home").getByText("PLACEHOLDER", { exact: false })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Open Browser" }).click();
    await expect(page.getByRole("heading", { name: "Browser", exact: true })).toBeFocused();
  }
});
