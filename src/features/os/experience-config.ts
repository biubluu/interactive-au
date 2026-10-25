import { storyTimeline } from "../../experience-timeline";
import { DEFAULT_SIMULATION_PIN } from "./os-store";
import type { WibClock } from "./wib-clock";
import type { WallpaperChoice } from "./os-wallpaper";

import type { IconName } from "../../components/app-artwork";
import type { VirtualAppId } from "../apps/registry";
export type { IconName } from "../../components/app-artwork";

export type PlaceholderApp = Readonly<{
  id: string;
  name: string;
  identity?: string;
  icon: IconName;
  color: string;
  placement: "grid" | "dock";
}>;

export type ExperienceConfig = Readonly<{
  simulationPin: string;
  storyClock: WibClock;
  lockScreen: Readonly<{ wallpaper: WallpaperChoice; clockColor: string; dateColor: string }>;
  homeWallpaper: WallpaperChoice;
  apps: readonly PlaceholderApp[];
  registeredApps: readonly VirtualAppId[];
}>;

const sunsetWallpaper: WallpaperChoice = { image: "/wallpapers/lock-screen.jpg", position: "50% 50%", fallback: "aurora" };

// Local OS presentation configuration. Unregistered entries remain PLACEHOLDER icons.
export const experienceConfig: ExperienceConfig = {
  simulationPin: DEFAULT_SIMULATION_PIN,
  // Fictional story timestamp, independent of the reader's device clock.
  storyClock: {
    time: "11:11",
    date: "Tue 17 Nov",
    dateKey: "2026-11-17",
    dateTime: storyTimeline.referenceInstant,
  },
  lockScreen: {
    wallpaper: sunsetWallpaper,
    clockColor: "#FF9A4D",
    dateColor: "#FF9A4D",
  },
  homeWallpaper: sunsetWallpaper,
  registeredApps: ["notes"],
  apps: [
    { id: "calendar", name: "Calendar", icon: "calendar", color: "#df564b", placement: "grid" },
    { id: "notes", name: "Notes", icon: "note", color: "#9b650c", placement: "grid" },
    { id: "x", name: "X", icon: "x", color: "#08090b", placement: "grid" },
    { id: "instagram", name: "Instagram", icon: "instagram", color: "#bd338b", placement: "grid" },
    { id: "music", name: "Apple Music", identity: "Apple Music", icon: "music", color: "#ce3266", placement: "grid" },
    { id: "settings", name: "Settings", icon: "settings", color: "#525b6b", placement: "grid" },
    { id: "browser", name: "Safari", icon: "compass", color: "#256e9f", placement: "grid" },
    { id: "phone", name: "Phone", icon: "phone", color: "#23834a", placement: "dock" },
    { id: "messages", name: "Messages", icon: "message", color: "#23834a", placement: "dock" },
    { id: "photos", name: "Photos", icon: "photo", color: "#a4469b", placement: "dock" },
    { id: "camera", name: "Camera", icon: "camera", color: "#505d70", placement: "dock" },
  ],
};
