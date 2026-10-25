import type { IconName } from "./experience-config";
type SymbolName = IconName | "lock" | "flashlight" | "arrow";

const paths: Record<SymbolName, string> = {
  message: "M5 5h22v16H14l-7 5v-5H5z M10 11h12 M10 16h8",
  phone: "M10 4 5 7c-2 9 11 22 20 20l3-5-7-4-3 3c-4-2-5-3-7-7l3-3z",
  camera: "M4 10h7l2-4h7l2 4h6v16H4z M22 18a6 6 0 1 1-12 0 6 6 0 0 1 12 0",
  photo: "M5 5h22v22H5z M5 23l7-9 6 6 4-4 5 7 M23 10h.01",
  note: "M7 4h18v24H7z M11 10h10 M11 15h10 M11 20h7",
  calendar: "M5 7h22v21H5z M10 4v6 M22 4v6 M5 13h22 M11 18h2 M19 18h2 M11 23h2 M19 23h2",
  map: "m4 8 8-4 8 4 8-4v20l-8 4-8-4-8 4z M12 4v20 M20 8v20",
  music: "M13 23V8l13-3v15 M13 11l13-3 M13 23c0 5-8 5-8 1 0-3 8-4 8-1 M26 20c0 5-8 5-8 1 0-3 8-4 8-1",
  mail: "M4 7h24v19H4z M4 7l12 11L28 7",
  compass: "M28 16a12 12 0 1 1-24 0 12 12 0 0 1 24 0 M21 11l-3 7-7 3 3-7z",
  settings: "M12 5h8l1 4 4 1 3 6-3 6-4 1-1 4h-8l-1-4-4-1-3-6 3-6 4-1z M21 16a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  folder: "M4 9h10l3 3h11v15H4z M4 9V5h10l3 4h11v3",
  lock: "M9 14V9a7 7 0 0 1 14 0v5 M6 14h20v15H6z M16 20v4",
  flashlight: "M10 4h12v7l-3 5v12h-6V16l-3-5z M10 9h12 M14 20h4",
  arrow: "m9 18 7-7 7 7",
};
export function OsIcon({ name }: Readonly<{ name: SymbolName }>) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
