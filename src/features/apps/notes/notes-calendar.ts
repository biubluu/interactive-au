import { storyTimeline as notesTimeline } from "../../../experience-timeline";

const calendar = new Intl.DateTimeFormat("en-CA", { timeZone: notesTimeline.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
const weekday = new Intl.DateTimeFormat("en-GB", { timeZone: notesTimeline.timeZone, weekday: "short" });
const month = new Intl.DateTimeFormat("en-GB", { timeZone: notesTimeline.timeZone, month: "long", year: "numeric" });
export function calendarDay(instant: string) {
  const parts = calendar.formatToParts(new Date(instant));
  const part = (name: string) => Number(parts.find((item) => item.type === name)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day")) / 86_400_000;
}
/** Calendar-day buckets in Jakarta, never elapsed 24-hour durations. */
export function noteDate(instant: string | null, reference: string = notesTimeline.referenceInstant) {
  if (!instant) return { group: "Date unavailable", label: "No date", order: -Infinity };
  const age = calendarDay(reference) - calendarDay(instant);
  const date = new Date(instant);
  const parts = calendar.formatToParts(date);
  const part = (name: string) => parts.find((item) => item.type === name)?.value ?? "";
  const compact = `${part("day")}/${part("month")}/${part("year").slice(-2)}`;
  if (age < 0) return { group: "Later dates", label: compact, order: 1 };
  if (age === 0) return { group: "Today", label: "Today", order: 0 };
  if (age === 1) return { group: "Yesterday", label: "Yesterday", order: -1 };
  if (age <= 7) return { group: "Previous 7 Days", label: weekday.format(date), order: -2 };
  if (age <= 30) return { group: "Previous 30 Days", label: compact, order: -3 };
  return { group: month.format(date), label: compact, order: -4 - calendarDay(reference) + calendarDay(instant) };
}
