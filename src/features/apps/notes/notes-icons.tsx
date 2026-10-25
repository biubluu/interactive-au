type Name = "back" | "more" | "compose" | "check" | "share" | "search" | "list" | "table" | "clip" | "markup" | "keyboard" | "native";
const paths: Record<Name, string> = {
  back: "m15 5-7 7 7 7", more: "M5 12h.01M12 12h.01M19 12h.01",
  compose: "M13 5H5v14h14v-8M10 14l1-4 8-8 3 3-8 8-4 1", check: "m5 12 4 4L19 6",
  share: "M8 8H5v13h14V8h-3M12 15V2m-4 4 4-4 4 4", search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  list: "M9 6h12M9 12h12M9 18h12M2 5l2 2 3-4M2 12h3M2 18h3", table: "M3 4h18v16H3zM3 9h18M3 14h18M9 4v16M15 4v16",
  clip: "m8 15 8-8a3 3 0 0 1 4 4L9 22a5 5 0 0 1-7-7L14 3a4 4 0 0 1 6 6L9 20",
  markup: "m8 17 4-11 4 11M10 14h4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  native: "M8 4h8M12 4v16M8 20h8M4 8v8M20 8v8",
  keyboard: "M2 5h20v13H2zM5 8h.01M9 8h.01M13 8h.01M17 8h.01M6 12h.01M10 12h.01M14 12h.01M7 15h10",
};
/** Original control artwork, not Apple assets. */
export function NotesIcon({ name }: Readonly<{ name: Name }>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "more" ? 3.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
