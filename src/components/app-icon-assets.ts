import type { IconName } from "./app-artwork";

/** Original full-bleed SVGs. App identity is metadata, not a virtual app registration. */
export const appIconAssets: Partial<Readonly<Record<IconName, string>>> = {
  x: "/app-icons/x.svg", message: "/app-icons/messages.svg", phone: "/app-icons/phone.svg",
  note: "/app-icons/notes.svg", camera: "/app-icons/camera.svg", photo: "/app-icons/photos.svg",
  music: "/app-icons/music.svg", compass: "/app-icons/safari.svg", calendar: "/app-icons/calendar.svg",
  instagram: "/app-icons/instagram.svg",
  settings: "/app-icons/settings.svg",
};
