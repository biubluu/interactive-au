import { UiIcon, type UiIconName } from "../../../components/ui-icon";

type Name = UiIconName | "markup" | "checklist";
/** Exceptional original symbols: Framework7 has no matching circled A/checklist. */
export function NotesIcon({ name }: Readonly<{ name: Name }>) {
  if (name !== "markup" && name !== "checklist") return <UiIcon name={name} />;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={name === "markup" ? "m8 17 4-11 4 11M10 14h4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0" : "M9 6h12M9 12h12M9 18h12M2 5l2 2 3-4M2 12h3M2 18h3"} /></svg>;
}
