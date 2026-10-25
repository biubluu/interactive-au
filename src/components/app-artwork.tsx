import { useId, type ReactNode } from "react";
export type IconName = "message" | "phone" | "camera" | "photo" | "note" | "calendar" | "map" | "music" | "mail" | "compass" | "settings" | "folder";

/** Original local SVG artwork. No Apple assets, fonts, or external resources. */
export function AppArtwork({ name }: Readonly<{ name: IconName }>) {
  const id = useId();
  const lens = `lens-${id}`;
  const shine = `shine-${id}`;
  const art: Record<IconName, ReactNode> = {
    calendar: <>
      <rect width="64" height="64" fill="#fffaf5" /><path d="M0 0h64v17H0z" fill="#ef524f" />
      <text x="32" y="13" textAnchor="middle" fill="white" fontSize="8" fontWeight="650">SUNDAY</text>
      <text x="32" y="52" textAnchor="middle" fill="#22252d" fontSize="34" fontWeight="350">25</text>
    </>,
    photo: <>
      <rect width="64" height="64" fill="#fbfafb" />
      {[["#f29a54", 12, 12], ["#df6a94", 29, 9], ["#a576c9", 43, 19], ["#60a2d8", 38, 38], ["#65bba5", 20, 43], ["#e2bf53", 9, 29]].map(([color, x, y]) =>
        <rect key={String(color)} x={x} y={y} width="16" height="16" rx="5" fill={String(color)} opacity=".94" transform={`rotate(15 ${x} ${y})`} />)}
      <rect x="25" y="25" width="15" height="15" rx="5" fill="#fff" opacity=".9" />
    </>,
    camera: <>
      <rect width="64" height="64" fill="#c9ced5" /><path d="M0 0h64v12H0z" fill="#e7eaee" />
      <rect x="7" y="18" width="50" height="34" rx="8" fill="#656e7b" /><path d="M21 18l4-7h15l4 7" fill="#656e7b" />
      <circle cx="32" cy="35" r="17" fill="#242c38" /><circle cx="32" cy="35" r="12" fill={`url(#${lens})`} />
      <circle cx="32" cy="35" r="7" fill="#111e35" /><circle cx="28" cy="31" r="3" fill="#8ddad2" opacity=".7" />
      <circle cx="51" cy="24" r="2" fill="#f6dc91" />
    </>,
    note: <>
      <rect width="64" height="64" fill="#fffcf2" /><path d="M0 0h64v18H0z" fill="#f5c748" />
      <path d="M10 29h44M10 38h44M10 47h35M10 56h28" stroke="#c5c6c4" strokeWidth="1.5" />
      <path d="M0 18h64" stroke="#cb9d2d" strokeWidth="1" />
    </>,
    map: <>
      <rect width="64" height="64" fill="#94c9a0" /><path d="M36 0h28v64H40l-9-22z" fill="#98c9e4" />
      <path d="M0 15h36v18H0zM3 45h23v19H3z" fill="#b8dca9" />
      <path d="M-5 48 44-5M18 69 64 18" stroke="#fff" strokeWidth="9" />
      <path d="M-5 48 44-5" stroke="#ebc86a" strokeWidth="4" />
      <circle cx="36" cy="34" r="14" fill="#fff" /><path d="m36 22 9 24-9-5-9 5z" fill="#377bd8" />
    </>,
    music: <>
      <path d="M44 12v30c0 9-17 13-17 4 0-6 8-9 12-8V22l-17 4v22c0 9-16 12-16 4 0-6 8-9 11-8V19z" fill="#fff" transform="translate(7 -1)" />
      <path d="m24 20 22-5" stroke="#ffd6e4" strokeWidth="2" opacity=".8" />
    </>,
    folder: <>
      <rect width="64" height="64" fill="#f5f7fc" />
      <path d="M8 20a4 4 0 0 1 4-4h15l6 6h19a4 4 0 0 1 4 4v25H8z" fill="#4389d2" />
      <path d="M8 29h48v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#65b2f0" />
      <path d="M12 29h40" stroke="#b9e0ff" strokeWidth="2" />
    </>,
    settings: <>
      <rect width="64" height="64" fill="#b1b7bf" />
      <circle cx="32" cy="32" r="23" fill="#555e6a" />
      {Array.from({ length: 12 }, (_, index) => <rect key={index} x="29" y="6" width="6" height="12" rx="1.5" fill="#e0e4e9" transform={`rotate(${index * 30} 32 32)`} />)}
      <circle cx="32" cy="32" r="18" fill="#d5dae1" /><circle cx="32" cy="32" r="13" fill="#737e8c" />
      <circle cx="32" cy="32" r="8" fill="#c4ccd6" /><circle cx="32" cy="32" r="4" fill="#4b5665" />
    </>,
    phone: <path d="M18 11c-5 0-8 5-7 11 3 16 14 27 28 31 7 2 13-2 13-7l-12-9-6 6c-8-4-13-9-17-17l6-5z" fill="white" />,
    message: <><path d="M53 29c0 12-10 21-23 21h-3l-12 6 2-11C7 40 6 24 14 16c11-11 31-9 37 4z" fill="white" /><path d="M17 25h27M17 32h21" stroke="#d5eee0" strokeWidth="3" strokeLinecap="round" /></>,
    mail: <><rect x="7" y="16" width="50" height="34" rx="5" fill="#fdfefe" /><path d="m8 18 24 19 24-19M8 49l17-15M56 49 39 34" fill="none" stroke="#73b4ee" strokeWidth="2" /></>,
    compass: <>
      <circle cx="32" cy="32" r="26" fill="#fbfcff" /><circle cx="32" cy="32" r="22" fill="#e3f2fc" />
      {Array.from({ length: 12 }, (_, index) => <path key={index} d="M32 9v4" stroke="#4183ad" strokeWidth="1.4" transform={`rotate(${index * 30} 32 32)`} />)}
      <path d="m44 17-9 19-15 11 9-19z" fill="#e65c61" /><path d="m20 47 9-19 6 8z" fill="#427db4" />
      <circle cx="32" cy="32" r="3" fill="#fff" />
    </>,
  };
  return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="os-app-artwork">
    <defs>
      <radialGradient id={lens}><stop stopColor="#6b9cb5" /><stop offset=".5" stopColor="#263e57" /><stop offset="1" stopColor="#0b1221" /></radialGradient>
      <linearGradient id={shine} x2=".5" y2="1"><stop stopColor="white" stopOpacity=".22" /><stop offset=".6" stopColor="white" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".06" /></linearGradient>
    </defs>
    {art[name]}
    <rect width="64" height="64" fill={`url(#${shine})`} />
  </svg>;
}
