import { expect, test } from "@playwright/test";

test("initial lock screen supports keyboard navigation, focus restoration, and reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Lock Screen, 9:41");
  await expect(page.getByText("Sunday, October 25")).toBeVisible();
  await expect(page.getByText("Enter Experience")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Simulate flashlight" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Simulate camera" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Unlock", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /Home Screen/ })).toBeFocused();
  const notes = page.getByRole("button", { name: "Open Notes — PLACEHOLDER" });
  await notes.click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  await expect(page.getByText("PLACEHOLDER APP", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(notes).toBeFocused();
  await page.getByRole("button", { name: "Lock device" }).click();
  await expect(page.getByRole("button", { name: "Unlock", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.reload();
  await expect(page.getByTestId("os-lock")).toBeVisible();
  expect(errors).toEqual([]);
});

test("shortcuts simulate visual feedback without invoking device APIs", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { get() { throw new Error("Native media access is forbidden"); } });
    Object.defineProperty(navigator, "getBattery", { get() { throw new Error("Native battery access is forbidden"); } });
  });
  await page.goto("/");
  const flashlight = page.getByRole("button", { name: "Simulate flashlight" });
  await flashlight.click();
  await expect(flashlight).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText(/PLACEHOLDER: simulated flashlight on/);
  await flashlight.click();
  await expect(flashlight).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Simulate camera" }).click();
  await expect(page.getByRole("status")).toHaveText(/No camera is accessed/);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.getByRole("button", { name: "Open Phone — PLACEHOLDER" }).click();
  await expect(page.getByRole("heading", { name: "Phone", exact: true })).toBeFocused();
});

test("navigation works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.getByTestId("os-home")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
