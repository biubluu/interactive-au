import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 }, { width: 375, height: 667 },
  { width: 393, height: 852 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 1366, height: 768 },
  { width: 1920, height: 1080 }, { width: 852, height: 393 },
];

for (const viewport of viewports) {
  test(`device geometry, lock and home at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Run the viewport matrix once.");
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
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
    if (viewport.width >= 600 && viewport.height > 540) {
      expect(screenBox.width / screenBox.height).toBeCloseTo(393 / 852, 2);
    }
    expect(await screen.evaluate((element) => getComputedStyle(element).overflow)).toBe("clip");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.getByTestId("device-content").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    // Status indicators remain on either side of the physical cutout.
    const timeBox = await page.locator(".os-status-time").boundingBox();
    const indicatorsBox = await page.locator(".os-status-indicators").boundingBox();
    if (!timeBox || !indicatorsBox) throw new Error("Missing status indicators");
    expect(timeBox.x + timeBox.width).toBeLessThanOrEqual(islandBox.x);
    expect(indicatorsBox.x).toBeGreaterThanOrEqual(islandBox.x + islandBox.width);
    await page.screenshot({ path: `artifacts/phase-4/lock-${viewport.width}x${viewport.height}.png`, fullPage: true });

    const unlock = page.getByRole("button", { name: "Unlock", exact: true });
    expect((await unlock.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await unlock.click();
    await expect(page.getByRole("heading", { name: /Home Screen/ })).toBeFocused();
    expect(await page.getByTestId("device-content").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/phase-4/home-${viewport.width}x${viewport.height}.png`, fullPage: true });
    for (const button of await page.getByRole("button", { name: /Open .*PLACEHOLDER/ }).all()) {
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "Open Browser — PLACEHOLDER" }).click();
    await expect(page.getByRole("heading", { name: "Browser", exact: true })).toBeFocused();

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

test("lock, home, and app placeholder are accessible in both surroundings", async ({ page }, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    for (const view of ["lock", "home", "app"]) {
      if (view === "home") await page.getByRole("button", { name: "Unlock", exact: true }).click();
      if (view === "app") await page.getByRole("button", { name: "Open Notes — PLACEHOLDER" }).click();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations).toEqual([]);
      if (colorScheme === "dark" && view !== "app") {
        await page.screenshot({ path: `artifacts/phase-4/${view}-${testInfo.project.name}-dark.png`, fullPage: true });
      }
    }
  }
});

test("navigation reflows with enlarged text and keeps the island fixed", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 683, height: 384 });
  await page.goto("/");
  const islandBefore = await page.getByTestId("dynamic-island").boundingBox();
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  const notes = page.getByRole("button", { name: "Open Notes — PLACEHOLDER" });
  await notes.click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(notes).toBeFocused();
  expect(await page.getByTestId("device-content").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect((await page.getByTestId("dynamic-island").boundingBox())?.y).toBe(islandBefore?.y);
  expect(await page.getByTestId("device-screen").evaluate((element) => element.scrollTop)).toBe(0);
  await page.screenshot({ path: `artifacts/phase-4/home-zoom-${testInfo.project.name}.png`, fullPage: true });
});
