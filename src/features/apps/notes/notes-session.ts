export type Note = Readonly<{ id: string; text: string; createdAt: string; updatedAt: string; editOrder: number }>;

/** App-local page-session data only: no storage, clocks, or OS navigation. */
export function createNotesSession(seed: readonly Note[]) {
  const copy = (notes: readonly Note[]) => notes.map((note) => ({ ...note }));
  let notes = copy(seed);
  return {
    read: (): readonly Note[] => copy(notes),
    commit(next: readonly Note[]) { notes = copy(next); return copy(notes); },
  };
}
