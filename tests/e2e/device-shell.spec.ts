import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { enterPasscode, openHome } from "./helpers";

const viewports = [
  { width: 320, height: 568 }, { width: 375, height: 667 },
  { width: 393, height: 852 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 1366, height: 768 },
  { width: 1920, height: 1080 }, { width: 852, height: 393 },
];

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-25T02:41:00Z"));
});

for (const viewport of viewports) {
  test(`device, passcode, and fullscreen layout at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Run the viewport matrix once.");
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("lock-clock")).toHaveText("09.41");
    const frame = page.getByTestId("device-frame");
    const screen = page.getByTestId("device-screen");
    const island = page.getByTestId("dynamic-island");
    const frameBox = await frame.boundingBox();
    const screenBox = await screen.boundingBox();
    const islandBox = await island.boundingBox();
    if (!frameBox || !screenBox || !islandBox) throw new Error("Missing device geometry");
    expect(frameBox.x).toBeGreaterThanOrEqual(0);
    expect(frameBox.y).toBeGreaterThanOrEqual(0);
    expect(frameBox.x + frameBox.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(frameBox.y + frameBox.height).toBeLessThanOrEqual(viewport.height + 1);
    expect(Math.abs(frameBox.x + frameBox.width / 2 - viewport.width / 2)).toBeLessThan(1);
    expect(Math.abs(islandBox.x + islandBox.width / 2 - screenBox.x - screenBox.width / 2)).toBeLessThan(1);
    expect(islandBox.width / screenBox.width).toBeCloseTo(0.31, 1);
    if (viewport.width >= 600 && viewport.height > 540) expect(screenBox.width / screenBox.height).toBeCloseTo(393 / 852, 2);
    expect(await screen.evaluate((element) => getComputedStyle(element).overflow)).toBe("clip");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const timeBox = await page.locator(".os-status-time").boundingBox();
    const indicatorsBox = await page.locator(".os-status-indicators").boundingBox();
    if (!timeBox || !indicatorsBox) throw new Error("Missing status indicators");
    expect(timeBox.x + timeBox.width).toBeLessThanOrEqual(islandBox.x);
    expect(indicatorsBox.x).toBeGreaterThanOrEqual(islandBox.x + islandBox.width);
    await page.screenshot({ path: `artifacts/phase-4.3/lock-${viewport.width}x${viewport.height}.png`, fullPage: true });

    const unlock = page.getByRole("button", { name: "Enter passcode", exact: true });
    expect((await unlock.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await unlock.click();
    await expect(page.getByRole("heading", { name: "Enter Passcode", exact: true })).toBeFocused();
    expect((await page.getByRole("button", { name: "1", exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: `artifacts/phase-4.3/passcode-${viewport.width}x${viewport.height}.png`, fullPage: true });
    await enterPasscode(page);
    expect(await page.getByTestId("os-home").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/phase-4.3/home-${viewport.width}x${viewport.height}.png`, fullPage: true });
    for (const button of await page.getByRole("button", { name: /^Open / }).all()) expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: "Open Browser", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Browser", exact: true })).toBeFocused();

    const app = page.getByTestId("os-app");
    const appBox = await app.boundingBox();
    if (!appBox) throw new Error("Missing fullscreen app");
    expect(Math.abs(appBox.width - screenBox.width)).toBeLessThan(1);
    expect(Math.abs(appBox.height - screenBox.height)).toBeLessThan(1);
    expect(Math.abs(appBox.x - screenBox.x)).toBeLessThan(1);
    expect(Math.abs(appBox.y - screenBox.y)).toBeLessThan(1);
    expect(await app.evaluate((element) => getComputedStyle(element).padding)).toBe("0px");
    expect(await app.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const safeViewport = await app.locator(".os-scene-content").boundingBox();
    if (!safeViewport) throw new Error("Missing safe-area viewport");
    expect(safeViewport.y).toBeGreaterThan(islandBox.y + islandBox.height);
    expect(safeViewport.y + safeViewport.height).toBeLessThan(screenBox.y + screenBox.height);
    const back = await page.getByRole("button", { name: "Back to Home" }).boundingBox();
    if (!back) throw new Error("Missing back control");
    expect(back.y).toBeGreaterThanOrEqual(islandBox.y + islandBox.height);
    await page.screenshot({ path: `artifacts/phase-4.3/app-${viewport.width}x${viewport.height}.png`, fullPage: true });

    const clipped = await screen.evaluate((element) => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;inset:-100px;background:magenta;z-index:999";
      element.append(probe);
      const rect = element.getBoundingClientRect();
      const result = document.elementFromPoint(rect.left + 1, rect.top + 1) !== probe
        && document.elementFromPoint(rect.left - 2, rect.top + rect.height / 2) !== probe
        && document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === probe;
      probe.remove();
      return result;
    });
    expect(clipped).toBe(true);
  });
}

test("all four scenes are accessible in light and dark surroundings", async ({ page }, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/");
    for (const view of ["lock", "passcode", "home", "app"]) {
      if (view === "passcode") await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
      if (view === "home") await enterPasscode(page);
      if (view === "app") await page.getByRole("button", { name: "Open Notes", exact: true }).click();
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      if (colorScheme === "dark") await page.screenshot({ path: `artifacts/phase-4.3/${view}-${testInfo.project.name}-dark.png`, fullPage: true });
    }
  }
});

test("enlarged text retains passcode access, app scrolling, and fixed hardware", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 683, height: 384 });
  await page.goto("/");
  const islandBefore = await page.getByTestId("dynamic-island").boundingBox();
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await openHome(page);
  const notes = page.getByRole("button", { name: "Open Notes", exact: true });
  await notes.click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  const app = page.getByTestId("os-app");
  expect(await app.locator(".os-scene-content").evaluate((element) => getComputedStyle(element).overflowY)).toBe("auto");
  expect(await app.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(notes).toBeFocused();
  expect((await page.getByTestId("dynamic-island").boundingBox())?.y).toBe(islandBefore?.y);
  expect(await page.getByTestId("device-screen").evaluate((element) => element.scrollTop)).toBe(0);
  await page.screenshot({ path: `artifacts/phase-4.3/home-zoom-${testInfo.project.name}.png`, fullPage: true });
});
