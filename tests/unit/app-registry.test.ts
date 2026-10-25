import { describe, expect, it, vi } from "vitest";
import { virtualApps, findVirtualApp } from "../../src/features/apps/registry";
import { NotesApp } from "../../src/features/apps/notes/notes-app";
import { createOsStore, DEFAULT_SIMULATION_PIN } from "../../src/features/os/os-store";
import { experienceConfig } from "../../src/features/os/experience-config";

describe("explicit virtual app registry", () => {
  it("registers only NotesApp with stable metadata and original artwork reference", () => {
    expect(virtualApps.map((app) => app.id)).toEqual(["notes"]);
    expect(findVirtualApp("notes")).toEqual({ id: "notes", displayName: "Notes", icon: "note", color: "#9b650c", Component: NotesApp });
    expect(experienceConfig.registeredApps).toEqual(["notes"]);
    expect(new Set(virtualApps.map((app) => app.id)).size).toBe(virtualApps.length);
    for (const placeholder of experienceConfig.apps.filter((app) => app.id !== "notes")) expect(findVirtualApp(placeholder.id)).toBeUndefined();
    expect(findVirtualApp("demo")).toBeUndefined();
  });
  it.each([undefined, null, 0, [], {}, "", "camera", "unknown", "__proto__", "constructor", "toString", "../notes/notes-app", "javascript:alert(1)"])("rejects unregistered input %j", (id) => {
    expect(findVirtualApp(id)).toBeUndefined();
  });
  it("does not coerce or execute arbitrary input", () => {
    const execute = vi.fn(() => { throw new Error("must not execute"); });
    expect(findVirtualApp({ toString: execute, [Symbol.toPrimitive]: execute })).toBeUndefined();
    expect(findVirtualApp(execute)).toBeUndefined();
    expect(execute).not.toHaveBeenCalled();
  });
  it("uses the existing guarded OS store for approved launch entries only", () => {
    const store = createOsStore([...experienceConfig.apps.map((app) => app.id), ...virtualApps.map((app) => app.id)]);
    store.getState().goHome();
    expect(store.getState().view.kind).toBe("lock");
    store.getState().openApp("notes");
    expect(store.getState().view.kind).toBe("lock");
    store.getState().unlock();
    store.getState().goHome();
    expect(store.getState().view.kind).toBe("passcode");
    DEFAULT_SIMULATION_PIN.split("").forEach((digit) => store.getState().enterDigit(digit));
    for (const id of ["unknown", "__proto__", {}, null]) {
      store.getState().openApp(id);
      expect(store.getState().view.kind).toBe("home");
    }
    store.getState().openApp("notes");
    expect(store.getState().view).toEqual({ kind: "app", appId: "notes" });
    store.getState().goHome();
    store.getState().openApp("camera");
    expect(store.getState().view).toEqual({ kind: "app", appId: "camera" });
  });
});
