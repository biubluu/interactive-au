import { NotesApp } from "./notes/notes-app";
import type { VirtualAppDefinition } from "./virtual-app";

export const virtualApps = [
  { id: "notes", displayName: "Notes", icon: "note", color: "#9b650c", Component: NotesApp },
] as const satisfies readonly VirtualAppDefinition[];

export type VirtualAppId = (typeof virtualApps)[number]["id"];

/** Reject untrusted values without coercion, property access, or code execution. */
export function findVirtualApp(id: unknown): VirtualAppDefinition | undefined {
  return typeof id === "string" ? virtualApps.find((app) => app.id === id) : undefined;
}
