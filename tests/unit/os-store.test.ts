import { describe, expect, it } from "vitest";
import { createOsStore } from "../../src/features/os/os-store";

describe("transient OS navigation", () => {
  it("starts locked and prevents app access before unlocking", () => {
    const store = createOsStore(["notes"]);
    store.getState().openApp("notes");
    store.getState().goHome();
    expect(store.getState().view).toEqual({ kind: "lock" });
  });

  it("unlocks, opens a configured placeholder, returns home, and locks", () => {
    const store = createOsStore(["notes"]);
    store.getState().unlock();
    expect(store.getState().view).toEqual({ kind: "home" });
    store.getState().openApp("notes");
    expect(store.getState().view).toEqual({ kind: "app", appId: "notes" });
    store.getState().goHome();
    expect(store.getState().view).toEqual({ kind: "home" });
    store.getState().lock();
    expect(store.getState().view).toEqual({ kind: "lock" });
  });

  it("rejects unknown IDs and cannot skip from one app to another", () => {
    const store = createOsStore(["notes", "camera"]);
    store.getState().unlock();
    store.getState().openApp("unknown");
    expect(store.getState().view).toEqual({ kind: "home" });
    store.getState().openApp("notes");
    store.getState().openApp("camera");
    store.getState().unlock();
    expect(store.getState().view).toEqual({ kind: "app", appId: "notes" });
  });

  it("isolates instances and starts a new instance locked", () => {
    const first = createOsStore(["notes"]);
    first.getState().unlock();
    first.getState().openApp("notes");
    const second = createOsStore(["notes"]);
    expect(second.getState().view).toEqual({ kind: "lock" });
    first.getState().lock();
    first.getState().unlock();
    expect(first.getState().view).toEqual({ kind: "home" });
  });
});
