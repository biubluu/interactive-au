import { expect, type Page } from "@playwright/test";
import { experienceConfig } from "../../src/features/os/experience-config";

export const simulationPin = experienceConfig.simulationPin;

export async function enterPasscode(page: Page) {
  await expect(page.getByTestId("os-passcode")).toBeVisible();
  for (const digit of simulationPin) await page.getByRole("button", { name: digit, exact: true }).click();
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
}

export async function openHome(page: Page) {
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await enterPasscode(page);
}
