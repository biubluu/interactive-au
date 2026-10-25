import { expect, test } from "@playwright/test";

test("entry is keyboard accessible and leads to an honest placeholder", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Interactive AU");
  const entry = page.getByRole("link", { name: "Enter Experience" });
  await page.keyboard.press("Tab");
  await expect(entry).toBeFocused();
  await expect(entry).toHaveAccessibleDescription(/PLACEHOLDER/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#experience-placeholder$/);
  await expect(page.getByRole("region", { name: "Experience placeholder" })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Experience placeholder" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("fits the viewport with reduced motion enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Enter Experience" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
