import { expect, test, type Page, type Locator } from "@playwright/test";
import { openHome } from "./helpers";

async function openNotes(page: Page) {
  await page.getByRole("button", { name: "Open Notes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  // Coordinates are measured after the icon-origin entry reaches its resting size.
  await expect.poll(() => page.getByTestId("os-app").evaluate((element) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).a - 1))).toBeLessThan(0.001);
}
async function drag(page: Page, target: Locator, distance: number) {
  await target.scrollIntoViewIfNeeded();
  const rect = await target.boundingBox();
  if (!rect) throw new Error("Missing gesture target");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2 - distance, { steps: 16 });
  await page.mouse.up();
}
async function appY(page: Page) {
  return page.getByTestId("os-app").evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42);
}

test("placeholder icons remain informational and untrusted app query input cannot launch an app", async ({ page }) => {
  await page.goto("/?app=__proto__");
  await expect(page.getByTestId("os-lock")).toBeVisible();
  await openHome(page);
  await expect(page.getByTestId("os-app")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Camera", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Camera", exact: true })).toBeFocused();
  await expect(page.getByText("Nothing here yet.")).toBeVisible();
  await expect(page.getByTestId("notes-app")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(page.getByRole("button", { name: "Open Camera", exact: true })).toBeFocused();
});

test("bottom control cannot bypass lock or passcode", async ({ page }) => {
  await page.goto("/");
  for (const screen of ["lock", "passcode"]) {
    await expect(page.getByTestId(`os-${screen}`)).toBeVisible();
    await expect(page.getByTestId("app-home-gesture")).toHaveCount(0);
    const pill = await page.locator(".os-home-indicator").boundingBox();
    if (!pill) throw new Error("Missing indicator");
    await page.mouse.click(pill.x + pill.width / 2, pill.y + pill.height / 2);
    await expect(page.getByTestId(`os-${screen}`)).toBeVisible();
    await expect(page.getByTestId("os-home")).toHaveCount(0);
    if (screen === "lock") await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  }
});

test("desktop non-touch Chromium mouse unlock and Home drags remain physically connected", async ({ browser, isMobile }) => {
  test.skip(isMobile, "Explicit desktop-only non-touch context.");
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, isMobile: false, hasTouch: false, reducedMotion: "no-preference" });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:4173/");
    // Physical host hardware can report touch points even with emulation disabled.
    expect(await page.evaluate(() => matchMedia("(pointer: fine)").matches)).toBe(true);
    await page.evaluate(() => {
      document.addEventListener("pointerdown", (event) => document.documentElement.dataset.lastPointer = event.pointerType);
    });
    await drag(page, page.getByTestId("unlock-gesture"), 160);
    await expect(page.getByTestId("os-passcode")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-last-pointer", "mouse");
    await page.keyboard.type("0411");
    await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
    await openNotes(page);
    const target = page.getByTestId("app-home-gesture");
    const box = await target.boundingBox();
    if (!box) throw new Error("Missing Home gesture");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 30, { steps: 8 });
    await expect.poll(() => appY(page)).toBeLessThan(-15);
    await page.mouse.up();
    await expect.poll(async () => Math.abs(await appY(page))).toBeLessThan(0.5);
    await drag(page, target, 110);
    await expect(page.getByRole("button", { name: "Open Notes", exact: true })).toBeFocused();
  } finally { await context.close(); }
});

test("touch Home swipe cancels incomplete input and closes a registered app", async ({ page, isMobile }) => {
  test.skip(!isMobile, "CDP touch input uses mobile context.");
  await page.goto("/");
  await openHome(page);
  await openNotes(page);
  const session = await page.context().newCDPSession(page);
  try {
    await page.getByRole("button", { name: "Create note" }).click();
    await page.getByRole("textbox", { name: "Note body" }).fill("Scrolling note\n" + "A long fictional line.\n".repeat(80));
    await page.getByRole("button", { name: "Hide keyboard", exact: true }).click();
    const content = page.getByRole("textbox", { name: "Note body" });
    await content.evaluate((element) => { element.scrollTop = 0; });
    const area = await content.boundingBox();
    if (!area) throw new Error("Missing scrolling area");
    const start = { x: area.x + area.width / 2, y: area.y + area.height - 40 };
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, id: 1 }] });
    for (let step = 1; step <= 12; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x, y: start.y - step * 18, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByTestId("notes-app")).toHaveAttribute("data-view", "editor");
    await expect.poll(async () => Math.abs(await appY(page))).toBeLessThan(0.5);
    for (const distance of [25, 110]) {
      const box = await page.getByTestId("app-home-gesture").boundingBox();
      if (!box) throw new Error("Missing touch target");
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
      for (let step = 1; step <= 12; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - distance * step / 12, id: 1 }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      if (distance === 25) {
        await expect(page.getByTestId("notes-app")).toBeVisible();
        await expect.poll(async () => Math.abs(await appY(page))).toBeLessThan(0.5);
      }
    }
    await expect(page.getByRole("button", { name: "Open Notes", exact: true })).toBeFocused();
  } finally { await session.detach(); }
});

test("fullscreen Notes keeps scrolling separate from Home gestures across layouts", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 852, height: 393 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openHome(page);
    await openNotes(page);
    await expect(page.getByTestId("os-app")).toHaveAttribute("data-motion", "reduced");
    const glass = await page.getByTestId("device-screen").boundingBox();
    const app = await page.getByTestId("os-app").boundingBox();
    const scroll = page.getByTestId("os-app").locator(".os-scene-content");
    const content = await scroll.boundingBox();
    const home = await page.getByTestId("app-home-gesture").boundingBox();
    if (!glass || !app || !content || !home) throw new Error("Missing app layout");
    expect(Math.abs(glass.width - app.width)).toBeLessThan(1);
    expect(Math.abs(glass.height - app.height)).toBeLessThan(1);
    expect(content.y + content.height).toBeLessThanOrEqual(home.y);
    await page.getByRole("button", { name: "Create note" }).click();
    await page.getByRole("textbox", { name: "Note body" }).fill("A long page\n" + "One more thought.\n".repeat(80));
    await page.getByRole("button", { name: "Hide keyboard", exact: true }).click();
    const text = page.getByRole("textbox", { name: "Note body" });
    await text.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    expect(await text.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByTestId("notes-app")).toHaveAttribute("data-view", "editor");
    expect(await scroll.evaluate((element) => getComputedStyle(element).touchAction)).not.toBe("none");
    // Pointer movement and a tap within app content cannot trigger OS Home.
    await drag(page, page.getByRole("textbox", { name: "Note body" }), 90);
    await expect(page.getByTestId("notes-app")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByTestId("app-home-gesture").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Open Notes", exact: true })).toBeFocused();
  }
});
