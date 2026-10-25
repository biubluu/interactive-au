import { uiIcons } from "./ui-icon-data";

export type UiIconName = keyof typeof uiIcons;
/** Locally bundled Framework7 SVGs: no icon font, loading gap, or runtime lookup. */
export function UiIcon({ name, viewBox = "0 0 56 56" }: Readonly<{ name: UiIconName; viewBox?: string }>) {
  const icon = uiIcons[name];
  return <svg className="ui-icon" data-glyph={icon.glyph} viewBox={viewBox} fill="currentColor" stroke="none" aria-hidden="true" focusable="false">
    {icon.paths.map((path, index) => <path d={path} key={index} />)}
  </svg>;
}
