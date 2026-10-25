"use client";

import { useState } from "react";
import { createNotesSession } from "./notes-session";
import { sampleNotes, saveNote, sortNotes } from "./notes-model";

// Survives app close/reopen in this page only; a reload recreates the seeded session.
const session = createNotesSession(sampleNotes);
export function useNotes() {
  const [notes, setNotes] = useState(() => sortNotes(session.read()));
  function save(id: string, text: string) {
    const next = saveNote(notes, id, text);
    if (next !== notes) setNotes(session.commit(next));
  }
  return { notes, save };
}
