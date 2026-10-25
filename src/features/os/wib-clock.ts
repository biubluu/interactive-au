export type WibClock = Readonly<{ time: string; date: string; dateKey: string; dateTime?: string }>;

// Identical markup on the server and during hydration; no device clock is read here.
export const initialWibClock: WibClock = { time: "--:--", date: "WIB", dateKey: "" };
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", weekday: "short", month: "short", day: "numeric" });
const keyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" });

export function formatWibClock(epoch: number): WibClock {
  const parts = keyFormat.formatToParts(epoch);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const dateParts = dateFormat.formatToParts(epoch);
  const date = ["weekday", "day", "month"].map((type) => dateParts.find((item) => item.type === type)?.value ?? "").join(" ");
  return {
    time: timeFormat.format(epoch),
    date,
    dateKey: `${part("year")}-${part("month")}-${part("day")}`,
    dateTime: new Date(epoch).toISOString(),
  };
}

export function nextMinuteDelay(epoch: number) {
  return 60_000 - (epoch % 60_000);
}

/** Called only by a mounted provider. One timer, aligned to minute boundaries. */
export function startWibClock(publish: (clock: WibClock) => void) {
  let timer: ReturnType<typeof setTimeout>;
  function refresh() {
    clearTimeout(timer);
    const now = Date.now();
    publish(formatWibClock(now));
    timer = setTimeout(refresh, nextMinuteDelay(now));
  }
  function onVisibility() {
    if (document.visibilityState === "visible") refresh();
  }
  timer = setTimeout(refresh, 0);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
