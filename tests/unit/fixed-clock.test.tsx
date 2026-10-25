import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { experienceConfig } from "../../src/features/os/experience-config";
import { WibClockProvider, useWibClock } from "../../src/features/os/wib-clock-provider";
import { formatWibClock } from "../../src/features/os/wib-clock";

function ClockProbe() {
  const clock = useWibClock();
  return <span>{clock.time} {clock.date}</span>;
}

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it("provides the configured story clock without device time or scheduled timers", () => {
  vi.useFakeTimers();
  vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("No device clock in fixed mode"); });
  expect(renderToStaticMarkup(<WibClockProvider clock={experienceConfig.storyClock}><ClockProbe /></WibClockProvider>))
    .toContain("11:11 Tue 17 Nov");
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps configured time, weekday, date, and ISO timestamp consistent", () => {
  const clock = experienceConfig.storyClock;
  expect(formatWibClock(Date.parse(clock.dateTime ?? ""))).toMatchObject({
    time: clock.time, date: clock.date, dateKey: clock.dateKey,
  });
  expect(clock.time).toBe("11:11");
  expect(clock.dateKey).toBe("2026-11-17");
});
