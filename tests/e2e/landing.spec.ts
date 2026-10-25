import { expect, test } from "@playwright/test";
import { openHome } from "./helpers";

test("keyboard unlock passes through PIN entry, preserves focus, and resets on reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/Lock Screen, .* WIB/);
  await expect(page.getByTestId("lock-clock")).toHaveText(/\d{2}:\d{2}/);
  await expect(page.getByText("PLACEHOLDER", { exact: false })).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Flashlight shortcut (visual only)", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Camera shortcut (visual only)", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Enter Passcode", exact: true })).toBeFocused();
  await page.keyboard.type("1111");
  await expect(page.getByRole("heading", { name: "Home Screen" })).toBeFocused();
  const notes = page.getByRole("button", { name: "Open Notes", exact: true });
  await notes.click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(notes).toBeFocused();
  await page.getByRole("button", { name: "Lock device" }).click();
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await page.reload();
  await expect(page.getByTestId("os-lock")).toBeVisible();
  expect(errors).toEqual([]);
});

test("visual shortcuts do not request device APIs or show verbose prototype notices", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { get() { throw new Error("Native media access is forbidden"); } });
    Object.defineProperty(navigator, "getBattery", { get() { throw new Error("Native battery access is forbidden"); } });
  });
  await page.goto("/");
  const flashlight = page.getByRole("button", { name: "Flashlight shortcut (visual only)", exact: true });
  await flashlight.click();
  await expect(flashlight).toHaveAttribute("aria-pressed", "true");
  await flashlight.click();
  await expect(flashlight).toHaveAttribute("aria-pressed", "false");
  const camera = page.getByRole("button", { name: "Camera shortcut (visual only)", exact: true });
  await camera.click();
  await expect(camera).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveCount(0);
  await openHome(page);
  await page.getByRole("button", { name: "Open Phone", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Phone", exact: true })).toBeFocused();
});

test("navigation works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openHome(page);
  await expect(page.getByTestId("os-home")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
