import { afterEach, describe, expect, it, vi } from "vitest";
import { formatWibClock, nextMinuteDelay, startWibClock } from "../../src/features/os/wib-clock";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("WIB clock", () => {
  it.each([
    ["2026-01-31T16:59:59Z", "2026-01-31T17:00:00Z", "2026-02-01", "Sun 1 Feb"],
    ["2026-12-31T16:59:59Z", "2026-12-31T17:00:00Z", "2027-01-01", "Fri 1 Jan"],
    ["2028-02-29T16:59:59Z", "2028-02-29T17:00:00Z", "2028-03-01", "Wed 1 Mar"],
  ])("updates the WIB calendar at boundary %s", (before, after, dateKey, date) => {
    expect(formatWibClock(Date.parse(before)).time).toBe("23:59");
    expect(formatWibClock(Date.parse(after))).toMatchObject({ time: "00:00", dateKey, date });
  });

  it("formats explicit Asia/Jakarta 24-hour time regardless of host timezone", () => {
    expect(formatWibClock(Date.parse("2026-10-25T02:41:00Z"))).toMatchObject({
      time: "09:41", date: "Sun 25 Oct", dateKey: "2026-10-25",
    });
  });

  it("changes date at WIB midnight and uses 00:00 instead of 24:00", () => {
    expect(formatWibClock(Date.parse("2026-10-25T16:59:59Z"))).toMatchObject({ time: "23:59", dateKey: "2026-10-25" });
    expect(formatWibClock(Date.parse("2026-10-25T17:00:00Z"))).toMatchObject({ time: "00:00", date: "Mon 26 Oct", dateKey: "2026-10-26" });
  });

  it("aligns one timer to the next minute and removes timers/listeners on cleanup", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T16:59:50Z"));
    const documentMock = Object.assign(new EventTarget(), { visibilityState: "visible" });
    vi.stubGlobal("document", documentMock);
    const publish = vi.fn();
    const stop = startWibClock(publish);
    vi.advanceTimersByTime(0);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(9_999);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(publish).toHaveBeenLastCalledWith(expect.objectContaining({ time: "00:00", dateKey: "2026-10-26" }));
    expect(vi.getTimerCount()).toBe(1);
    vi.setSystemTime(new Date("2026-10-25T20:12:12Z"));
    documentMock.dispatchEvent(new Event("visibilitychange"));
    expect(publish).toHaveBeenLastCalledWith(expect.objectContaining({ time: "03:12" }));
    documentMock.visibilityState = "hidden";
    const hiddenCalls = publish.mock.calls.length;
    vi.setSystemTime(new Date("2026-12-31T17:03:00Z"));
    documentMock.dispatchEvent(new Event("visibilitychange"));
    expect(publish).toHaveBeenCalledTimes(hiddenCalls);
    documentMock.visibilityState = "visible";
    documentMock.dispatchEvent(new Event("visibilitychange"));
    expect(publish).toHaveBeenLastCalledWith(expect.objectContaining({ time: "00:03", date: "Fri 1 Jan", dateKey: "2027-01-01" }));
    expect(vi.getTimerCount()).toBe(1);
    stop();
    expect(vi.getTimerCount()).toBe(0);
    const calls = publish.mock.calls.length;
    documentMock.dispatchEvent(new Event("visibilitychange"));
    expect(publish).toHaveBeenCalledTimes(calls);
    expect(nextMinuteDelay(Date.parse("2026-10-25T20:12:12Z"))).toBe(48_000);
  });
});
