import { describe, expect, it } from "vitest";
import { displayWibTime } from "../../src/features/os/clock-presentation";
import { formatWibClock } from "../../src/features/os/wib-clock";

describe("WIB clock presentation", () => {
  it.each([["00:00", "00.00"], ["09:41", "09.41"], ["14:03", "14.03"], ["23:59", "23.59"], ["--:--", "--.--"]])(
    "displays %s as %s without reading a clock", (model, display) => {
      expect(displayWibTime(model)).toBe(display);
    },
  );

  it("never rewrites the time model, date, or ISO timestamp", () => {
    const clock = formatWibClock(Date.parse("2026-10-25T17:00:00Z"));
    expect(displayWibTime(clock.time)).toBe("00.00");
    expect(clock.time).toBe("00:00");
    expect(clock.date).toBe("Mon 26 Oct");
    expect(clock.dateTime).toBe("2026-10-25T17:00:00.000Z");
    expect(displayWibTime(clock.dateTime ?? "")).toBe(clock.dateTime);
  });
});
