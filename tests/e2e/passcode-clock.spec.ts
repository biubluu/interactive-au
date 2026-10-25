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

test("WIB clock is shared, crosses midnight, and refreshes on visibility without hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.clock.install({ time: new Date("2026-10-25T16:58:50Z") });
  await page.clock.pauseAt(new Date("2026-10-25T16:59:50Z"));
  await page.goto("/");
  await page.clock.runFor(1);
  await expect(page.getByTestId("lock-clock")).toHaveText("23.59");
  await expect(page.getByTestId("status-clock")).toHaveText("23.59");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Lock Screen, 23:59 WIB");
  await expect(page.getByTestId("lock-clock")).toHaveAttribute("datetime", /^2026-10-25T16:59:50\.\d{3}Z$/);
  await expect(page.locator(".os-date")).toHaveText("Sun 25 Oct");
  await page.clock.runFor(9_999);
  await expect(page.getByTestId("lock-clock")).toHaveText("00.00");
  await expect(page.getByTestId("status-clock")).toHaveText("00.00");
  await expect(page.locator(".os-date")).toHaveText("Mon 26 Oct");
  await page.clock.setSystemTime(new Date("2026-10-25T20:12:12Z"));
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByTestId("lock-clock")).toHaveText("03.12");
  await expect(page.getByTestId("status-clock")).toHaveText("03.12");
  expect(errors).toEqual([]);
});

for (const boundary of [
  { before: "2026-01-31T16:59:50Z", date: "Sun 1 Feb", key: "2026-02-01", resume: "2026-02-02T17:05:00Z", resumeDate: "Tue 3 Feb" },
  { before: "2026-12-31T16:59:50Z", date: "Fri 1 Jan", key: "2027-01-01", resume: "2027-01-02T17:05:00Z", resumeDate: "Sun 3 Jan" },
]) {
  test(`live WIB calendar crosses ${boundary.key} and catches up after tab visibility`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.clock.install({ time: new Date(new Date(boundary.before).getTime() - 60_000) });
    await page.clock.pauseAt(new Date(boundary.before));
    await page.goto("/");
    await page.clock.runFor(1);
    await expect(page.getByTestId("lock-clock")).toHaveText("23.59");
    await page.clock.runFor(9_999);
    await expect(page.getByTestId("lock-clock")).toHaveText("00.00");
    await expect(page.getByTestId("status-clock")).toHaveText("00.00");
    await expect(page.locator(".os-date")).toHaveText(boundary.date);
    await expect(page.locator(".os-date time")).toHaveAttribute("datetime", boundary.key);
    await page.clock.setSystemTime(new Date(boundary.resume));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(page.locator(".os-date")).toHaveText(boundary.resumeDate);
    await expect(page.getByTestId("status-clock")).toHaveText("00.05");
    await expect(page.getByTestId("lock-clock")).toHaveText("00.05");
    expect(errors).toEqual([]);
  });
}
