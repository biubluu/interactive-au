import { createStore } from "zustand/vanilla";

type View = { kind: "lock" } | { kind: "home" } | { kind: "app"; appId: string };
type OsState = {
  view: View;
  unlock: () => void;
  lock: () => void;
  openApp: (id: string) => void;
  goHome: () => void;
};

/** Transient UI only. Each mounted experience gets a separate, unpersisted store. */
export function createOsStore(appIds: readonly string[]) {
  const allowedApps = new Set(appIds);
  return createStore<OsState>((set, get) => ({
    view: { kind: "lock" },
    unlock: () => { if (get().view.kind === "lock") set({ view: { kind: "home" } }); },
    lock: () => set({ view: { kind: "lock" } }),
    openApp: (id) => {
      if (get().view.kind === "home" && allowedApps.has(id)) set({ view: { kind: "app", appId: id } });
    },
    goHome: () => { if (get().view.kind === "app") set({ view: { kind: "home" } }); },
  }));
}
