import { createStore } from "zustand/vanilla";

// Story simulation only. This is public client code, not an authentication boundary.
export const DEFAULT_SIMULATION_PIN = "0411";
export type OsView = { kind: "lock" } | { kind: "passcode"; digits: string; error: boolean } | { kind: "home" } | { kind: "app"; appId: string };
type OsState = {
  view: OsView;
  unlock: () => void;
  enterDigit: (digit: string) => void;
  deleteDigit: () => void;
  lock: () => void;
  openApp: (id: unknown) => void;
  goHome: () => void;
};

/** Transient UI only; entered digits exist only in the passcode view and are never persisted. */
export function createOsStore(appIds: readonly string[], pin = DEFAULT_SIMULATION_PIN) {
  if (!/^\d{4}$/.test(pin)) throw new Error("The simulation PIN must contain exactly four digits.");
  const allowedApps = new Set(appIds);
  return createStore<OsState>((set, get) => ({
    view: { kind: "lock" },
    unlock: () => { if (get().view.kind === "lock") set({ view: { kind: "passcode", digits: "", error: false } }); },
    enterDigit: (digit) => {
      const view = get().view;
      if (view.kind !== "passcode" || !/^\d$/.test(digit)) return;
      const digits = view.digits + digit;
      if (digits.length === 4) {
        set({ view: digits === pin ? { kind: "home" } : { kind: "passcode", digits: "", error: true } });
      } else set({ view: { kind: "passcode", digits, error: false } });
    },
    deleteDigit: () => {
      const view = get().view;
      if (view.kind === "passcode" && (view.digits || view.error)) {
        set({ view: { kind: "passcode", digits: view.digits.slice(0, -1), error: false } });
      }
    },
    lock: () => { if (get().view.kind !== "lock") set({ view: { kind: "lock" } }); },
    openApp: (id) => {
      if (get().view.kind === "home" && typeof id === "string" && allowedApps.has(id)) set({ view: { kind: "app", appId: id } });
    },
    goHome: () => { if (get().view.kind === "app") set({ view: { kind: "home" } }); },
  }));
}
