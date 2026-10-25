export type IconName = "message" | "phone" | "camera" | "photo" | "note" | "calendar" | "map" | "music" | "mail" | "compass" | "settings" | "folder";

export type PlaceholderApp = Readonly<{
  id: string;
  name: string;
  icon: IconName;
  color: string;
  placement: "grid" | "dock";
}>;

export type ExperienceConfig = Readonly<{
  simulationPin: string;
  wallpaper: "aurora" | "midnight";
  apps: readonly PlaceholderApp[];
}>;

// Display-only PLACEHOLDER configuration, not a virtual app registry.
export const experienceConfig: ExperienceConfig = {
  simulationPin: "1111",
  wallpaper: "aurora",
  apps: [
    { id: "calendar", name: "Calendar", icon: "calendar", color: "#df564b", placement: "grid" },
    { id: "photos", name: "Photos", icon: "photo", color: "#a4469b", placement: "grid" },
    { id: "camera", name: "Camera", icon: "camera", color: "#505d70", placement: "grid" },
    { id: "notes", name: "Notes", icon: "note", color: "#9b650c", placement: "grid" },
    { id: "maps", name: "Maps", icon: "map", color: "#247563", placement: "grid" },
    { id: "music", name: "Music", icon: "music", color: "#ce3266", placement: "grid" },
    { id: "files", name: "Files", icon: "folder", color: "#2675b8", placement: "grid" },
    { id: "settings", name: "Settings", icon: "settings", color: "#525b6b", placement: "grid" },
    { id: "phone", name: "Phone", icon: "phone", color: "#23834a", placement: "dock" },
    { id: "messages", name: "Messages", icon: "message", color: "#23834a", placement: "dock" },
    { id: "mail", name: "Mail", icon: "mail", color: "#236fc0", placement: "dock" },
    { id: "browser", name: "Browser", icon: "compass", color: "#256e9f", placement: "dock" },
  ],
};
