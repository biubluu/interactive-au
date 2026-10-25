import { expect, type Page } from "@playwright/test";

export async function enterPasscode(page: Page) {
  await expect(page.getByTestId("os-passcode")).toBeVisible();
  for (let index = 0; index < 4; index += 1) await page.getByRole("button", { name: "1", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
}

export async function openHome(page: Page) {
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await enterPasscode(page);
}
