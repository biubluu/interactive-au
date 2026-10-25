import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 852, height: 393 },
];

for (const viewport of viewports) {
  test(`device geometry and clipping at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    // The existing mobile project retains touch coverage. Run the size matrix once.
    test.skip(testInfo.project.name !== "desktop-chromium", "Viewport matrix runs once on Chromium.");
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
    expect(islandBox.y).toBeGreaterThan(screenBox.y);

    if (viewport.width >= 600 && viewport.height > 540) {
      expect(screenBox.width / screenBox.height).toBeCloseTo(393 / 852, 2);
    }
    expect(await screen.evaluate((element) => getComputedStyle(element).overflow)).toBe("clip");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.getByTestId("device-content").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    const entry = page.getByRole("link", { name: "Enter Experience" });
    await entry.scrollIntoViewIfNeeded();
    const entryBox = await entry.boundingBox();
    expect(entryBox?.height).toBeGreaterThanOrEqual(44);
    await entry.click();
    const notice = page.getByRole("region", { name: "Experience placeholder" });
    await expect(notice).toBeFocused();
    const noticeBox = await notice.boundingBox();
    if (!noticeBox) throw new Error("Missing placeholder notice");
    expect(noticeBox.y).toBeGreaterThanOrEqual(islandBox.y + islandBox.height);
    expect(noticeBox.y + noticeBox.height).toBeLessThanOrEqual(screenBox.y + screenBox.height);

    await page.goto("/");
    await page.screenshot({ path: `artifacts/phase-2/device-${viewport.width}x${viewport.height}-light.png`, fullPage: true });

    // An oversized descendant must neither paint nor receive hits outside rounded glass.
    const clipped = await screen.evaluate((element) => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;inset:-100px;background:magenta;z-index:999";
      element.append(probe);
      const rect = element.getBoundingClientRect();
      const corner = document.elementFromPoint(rect.left + 1, rect.top + 1);
      const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const outside = document.elementFromPoint(rect.left - 2, rect.top + rect.height / 2);
      const result = corner !== probe && outside !== probe && center === probe;
      probe.remove();
      return result;
    });
    expect(clipped).toBe(true);
  });
}

test("accessible in both surrounding color schemes", async ({ page }, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    if (colorScheme === "dark") {
      await page.screenshot({ path: `artifacts/phase-2/device-${testInfo.project.name}-dark.png`, fullPage: true });
    }
  }
});

test("reflows at 200% browser zoom equivalent and enlarged text", async ({ page }) => {
  // 1366x768 at 200% desktop zoom gives a 683x384 CSS viewport.
  // deviceScaleFactor only changes pixel density and is not a zoom test.
  await page.setViewportSize({ width: 683, height: 384 });
  await page.goto("/");
  const islandBefore = await page.getByTestId("dynamic-island").boundingBox();
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const entry = page.getByRole("link", { name: "Enter Experience" });
  await entry.scrollIntoViewIfNeeded();
  await entry.click();
  await expect(page.getByRole("region", { name: "Experience placeholder" })).toBeFocused();
  await page.getByTestId("device-content").evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const islandAfter = await page.getByTestId("dynamic-island").boundingBox();
  expect(islandAfter?.y).toBe(islandBefore?.y);
  expect(await page.getByTestId("device-screen").evaluate((element) => element.scrollTop)).toBe(0);
  const endOfNotice = await page.locator("#entry-description").evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const text = element.firstChild;
    if (!text?.textContent) throw new Error("Missing notice text");
    range.setStart(text, text.textContent.trimEnd().length - 1);
    range.setEnd(text, text.textContent.trimEnd().length);
    return range.getBoundingClientRect().bottom;
  });
  const screenBox = await page.getByTestId("device-screen").boundingBox();
  if (!screenBox) throw new Error("Missing screen");
  expect(endOfNotice).toBeLessThanOrEqual(screenBox.y + screenBox.height);
  await page.screenshot({ path: `artifacts/phase-2/device-zoom-${test.info().project.name}.png`, fullPage: true });
});
