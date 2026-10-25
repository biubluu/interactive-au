import type { Note } from "./notes-session";
import { storyTimeline as notesTimeline } from "../../../experience-timeline";

/** Original PLACEHOLDER records with authored fictional dates, never reader history. */
export const sampleNotes: readonly Note[] = [
  { id: "sample-window", text: "Aku kangen bek\nKapan terakhir kali bek ke Depok dan ada aku di dalamnya. Kapan terakhir kali aku ke Cimahi dan kita bakar lemak, lemakku sih, bek mah kecil sekali. Kita sama-sama sibuk, tapi bek keren.", createdAt: "2026-11-16T09:00:00+07:00", updatedAt: "2026-11-16T09:00:00+07:00", editOrder: 0 },
  { id: "sample-saturday", text: "List agar tetap hidup\n- Menonton kairawrdino episode membangun hotel bukan Indonesia.\n- Menonton kairawrdino episode menjadi racer demi kemakmuran gaji WNI.", createdAt: "2026-11-14T10:00:00+07:00", updatedAt: "2026-11-14T10:00:00+07:00", editOrder: 0 },
  { id: "sample-colors", text: "Colors to remember\nWarm amber, pale blue, and the green after rain.", createdAt: "2026-10-24T08:00:00+07:00", updatedAt: "2026-10-24T08:00:00+07:00", editOrder: 0 },
];
export function splitNote(text: string) {
  const match = /[^\r\n]*\S[^\r\n]*/.exec(text);
  if (!match) return { prefix: text, title: "", body: "", separator: "" };
  const end = match.index + match[0].length;
  const separator = text.slice(end).startsWith("\r\n") ? "\r\n" : text[end] === "\n" ? "\n" : "";
  return { prefix: text.slice(0, match.index), title: match[0], body: text.slice(end + separator.length), separator };
}
export function joinNote(parts: ReturnType<typeof splitNote>) {
  return parts.prefix + parts.title + (parts.body || parts.separator ? parts.separator || "\n" : "") + parts.body;
}
export function noteSummary(text: string) {
  const parts = splitNote(text);
  return { title: parts.title.trim() || "New Note", preview: parts.body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(" ") };
}
export function sortNotes(notes: readonly Note[]) {
  return [...notes].sort((a, b) => (b.updatedAt ? Date.parse(b.updatedAt) : -Infinity) - (a.updatedAt ? Date.parse(a.updatedAt) : -Infinity)
    || b.editOrder - a.editOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
export function saveNote(notes: readonly Note[], id: string, text: string, instant: string = notesTimeline.referenceInstant): readonly Note[] {
  const existing = notes.find((note) => note.id === id);
  if (existing?.text === text || (!existing && !text.trim())) return notes;
  const remaining = notes.filter((note) => note.id !== id);
  if (!text.trim()) return remaining;
  const editOrder = Math.max(0, ...notes.map((note) => note.editOrder)) + 1;
  return sortNotes([{ ...existing, id, text, createdAt: existing ? existing.createdAt : instant, updatedAt: instant, editOrder }, ...remaining]);
}
export function newNoteId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
}
