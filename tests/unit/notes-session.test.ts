import { describe, expect, it } from "vitest";
import { createNotesSession } from "../../src/features/apps/notes/notes-session";
import { sampleNotes, noteSummary, saveNote, sortNotes, splitNote, joinNote } from "../../src/features/apps/notes/notes-model";
import { noteDate } from "../../src/features/apps/notes/notes-calendar";
import { storyTimeline as notesTimeline } from "../../src/experience-timeline";
import { experienceConfig } from "../../src/features/os/experience-config";

describe("Notes session data and fictional calendar", () => {
  it.each([[0,"Today"],[1,"Yesterday"],[2,"Previous 7 Days"],[7,"Previous 7 Days"],[8,"Previous 30 Days"],[30,"Previous 30 Days"],[31,"October 2026"]])("classifies calendar age %i without overlap", (age, group) => {
    const instant = new Date(Date.parse(notesTimeline.referenceInstant) - Number(age) * 86_400_000).toISOString();
    expect(noteDate(instant).group).toBe(group);
  });
  it.each([
    ["2026-03-01T00:05:00+07:00", "2026-02-28T23:59:00+07:00"],
    ["2027-01-01T00:05:00+07:00", "2026-12-31T23:59:00+07:00"],
    ["2028-03-01T00:05:00+07:00", "2028-02-29T23:59:00+07:00"],
  ])("uses Jakarta calendar dates across month/year/leap boundaries", (reference, record) => {
    expect(noteDate(record, reference).group).toBe("Yesterday");
  });
  it("uses contextual weekdays, compact old dates, and honest unknown dates", () => {
    expect(noteDate("2026-11-14T10:00:00+07:00").label).toBe("Sat");
    expect(noteDate("2026-10-24T08:00:00+07:00").label).toBe("24/10/26");
    expect(noteDate(null).group).toBe("Date unavailable");
    expect(noteDate("2026-11-18T00:00:00+07:00").group).toBe("Later dates");
  });
  it.each(["Title", "Title\n", "\n  A title  \r\nBody\r\nMore", "Title\n\nBody", " \nTitle\nBody"])('round-trips original plain text %j without changes', (text) => {
    expect(joinNote(splitNote(text))).toBe(text);
  });
  it("makes unchanged and repeated saves no-ops; changes update only fictional metadata", () => {
    expect(saveNote(sampleNotes, sampleNotes[0].id, sampleNotes[0].text)).toBe(sampleNotes);
    const changed = saveNote(sampleNotes, sampleNotes[0].id, "Updated\nBody");
    expect(changed[0]).toMatchObject({ id: sampleNotes[0].id, updatedAt: notesTimeline.referenceInstant, createdAt: sampleNotes[0].createdAt });
    expect(saveNote(changed, changed[0].id, changed[0].text)).toBe(changed);
    const next = saveNote(changed, sampleNotes[1].id, "Another change");
    expect(next[0].id).toBe(sampleNotes[1].id);
    expect(next[0].updatedAt).toBe(next[1].updatedAt);
    expect(next[0].editOrder).toBeGreaterThan(next[1].editOrder);
    expect(sortNotes([...next].reverse()).map((note) => note.id)).toEqual(next.map((note) => note.id));
    expect(saveNote([], "x", " \n ")).toHaveLength(0);
    expect(noteSummary("\nTitle\nBody")).toEqual({ title: "Title", preview: "Body" });
  });
  it("keeps saved changes only in one page session and resets a new session to seeds", () => {
    const session = createNotesSession(sampleNotes);
    const initial = session.read();
    const changed = saveNote(initial, "session-note", "Temporary\nBody");
    session.commit(changed);
    expect(session.read().find((note) => note.id === "session-note")?.text).toBe("Temporary\nBody");
    expect(createNotesSession(sampleNotes).read()).toEqual(sampleNotes);
    expect(sampleNotes).toEqual(initial);
  });
  it("returns copies so consumers cannot mutate the original story samples", () => {
    const session = createNotesSession(sampleNotes);
    const result = [...session.read()]; result.pop();
    expect(session.read()).toHaveLength(sampleNotes.length);
    expect(sampleNotes.every((note) => note.createdAt && note.updatedAt)).toBe(true);
    expect(sampleNotes.map((note) => noteDate(note.updatedAt).group)).toEqual(["Yesterday", "Previous 7 Days", "Previous 30 Days"]);
  });
  it("keeps shared timeline, wallpaper, and PIN unchanged", () => {
    expect(experienceConfig.homeWallpaper).toBe(experienceConfig.lockScreen.wallpaper);
    expect(experienceConfig.storyClock.dateTime).toBe(notesTimeline.referenceInstant);
    expect(experienceConfig.storyClock.date).toBe("Tue 17 Nov"); expect(experienceConfig.simulationPin).toBe("0411");
  });
});
