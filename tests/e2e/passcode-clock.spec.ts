import { expect, test } from "@playwright/test";
import { enterPasscode, simulationPin } from "./helpers";

test.use({ timezoneId: "America/Los_Angeles" });

test("incorrect PIN clears, keyboard delete works, cancel and relock discard digits", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await page.keyboard.type("1112");
  await expect(page.getByTestId("os-passcode").getByRole("alert")).toHaveText("Incorrect passcode. Try again.");
  await expect(page.getByRole("img", { name: "0 of 4 digits entered" })).toBeVisible();
  await expect(page.getByTestId("os-home")).toHaveCount(0);
  await page.keyboard.type("12");
  await expect(page.getByRole("img", { name: "2 of 4 digits entered" })).toBeVisible();
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("img", { name: "1 of 4 digits entered" })).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(page.getByRole("img", { name: "0 of 4 digits entered" })).toBeVisible();
  await page.keyboard.type("11");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Enter passcode", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await expect(page.getByRole("img", { name: "0 of 4 digits entered" })).toBeVisible();
  await page.keyboard.type(simulationPin);
  await expect(page.getByRole("heading", { name: "Home Screen", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Lock device" }).click();
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await expect(page.getByRole("img", { name: "0 of 4 digits entered" })).toBeVisible();
  await expect(page.locator(".os-pin-dots").first()).toHaveText("");
});

test("numeric controls support deletion and a correct automatic submit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter passcode", exact: true }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.getByRole("button", { name: "Delete last digit", exact: true }).click();
  await expect(page.getByRole("img", { name: "0 of 4 digits entered" })).toBeVisible();
  await enterPasscode(page);
  await expect(page.getByTestId("os-passcode")).toHaveCount(0);
});

for (const timezoneId of ["America/Los_Angeles", "Asia/Jakarta", "Pacific/Auckland"]) {
  test.describe(`fixed story clock in ${timezoneId}`, () => {
    test.use({ timezoneId });
    test("is stable across time, visibility, reload, and hydration", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      await page.clock.install({ time: new Date("2026-12-31T16:58:00Z") });
      await page.clock.pauseAt(new Date("2026-12-31T16:59:00Z"));
      await page.goto("/");
      async function assertClock() {
        await expect(page.getByTestId("lock-clock")).toHaveText("11.11");
        await expect(page.getByTestId("status-clock")).toHaveText("11.11");
        await expect(page.locator(".os-date")).toHaveText("Tue 17 Nov");
        await expect(page.locator(".os-date time")).toHaveAttribute("datetime", "2026-11-17");
        await expect(page.getByTestId("lock-clock")).toHaveAttribute("datetime", "2026-11-17T11:11:00+07:00");
        await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Lock Screen, 11:11 WIB");
      }
      await assertClock();
      await page.clock.runFor(120_000);
      await assertClock();
      await page.clock.setSystemTime(new Date("2040-07-01T12:30:00Z"));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await assertClock();
      await page.reload();
      await assertClock();
      expect(errors).toEqual([]);
    });
  });
}
