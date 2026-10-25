import { describe, expect, it } from "vitest";
import { createOsStore, DEFAULT_SIMULATION_PIN } from "../../src/features/os/os-store";
import { experienceConfig } from "../../src/features/os/experience-config";

describe("OS passcode navigation", () => {
  it("uses the same configured PIN, retaining its leading zero", () => {
    expect(DEFAULT_SIMULATION_PIN).toBe("0411");
    expect(experienceConfig.simulationPin).toBe(DEFAULT_SIMULATION_PIN);
  });
  it("requires passcode entry after unlock and refuses direct app access", () => {
    const store = createOsStore(["notes"]);
    store.getState().openApp("notes");
    expect(store.getState().view).toEqual({ kind: "lock" });
    store.getState().unlock();
    store.getState().openApp("notes");
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "", error: false });
    DEFAULT_SIMULATION_PIN.split("").forEach((digit) => store.getState().enterDigit(digit));
    expect(store.getState().view).toEqual({ kind: "home" });
    store.getState().openApp("notes");
    expect(store.getState().view).toEqual({ kind: "app", appId: "notes" });
    store.getState().goHome();
    expect(store.getState().view).toEqual({ kind: "home" });
  });

  it("clears incorrect entry and permits a correct retry", () => {
    const store = createOsStore([]);
    store.getState().unlock();
    "1234".split("").forEach((digit) => store.getState().enterDigit(digit));
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "", error: true });
    store.getState().enterDigit("0");
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "0", error: false });
    "411".split("").forEach((digit) => store.getState().enterDigit(digit));
    expect(store.getState().view).toEqual({ kind: "home" });
  });

  it("supports deletion, cancel/relock, and clears digits outside the passcode state", () => {
    const store = createOsStore([]);
    store.getState().unlock();
    store.getState().enterDigit("1");
    store.getState().enterDigit("2");
    store.getState().deleteDigit();
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "1", error: false });
    store.getState().lock();
    store.getState().unlock();
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "", error: false });
    DEFAULT_SIMULATION_PIN.split("").forEach((digit) => store.getState().enterDigit(digit));
    store.getState().lock();
    expect(store.getState().view).toEqual({ kind: "lock" });
    store.getState().enterDigit("1");
    expect(store.getState().view).toEqual({ kind: "lock" });
  });

  it("rejects invalid inputs and unknown apps; repeated navigation is idempotent", () => {
    const store = createOsStore(["notes", "camera"]);
    for (let index = 0; index < 8; index += 1) store.getState().unlock();
    store.getState().enterDigit("x");
    store.getState().enterDigit("11");
    expect(store.getState().view).toEqual({ kind: "passcode", digits: "", error: false });
    (DEFAULT_SIMULATION_PIN + "123").split("").forEach((digit) => store.getState().enterDigit(digit));
    store.getState().openApp("unknown");
    expect(store.getState().view).toEqual({ kind: "home" });
    store.getState().openApp("notes");
    store.getState().openApp("camera");
    store.getState().unlock();
    expect(store.getState().view).toEqual({ kind: "app", appId: "notes" });
  });

  it("uses configurable four-digit simulation PINs and isolates instances", () => {
    expect(() => createOsStore([], "123")).toThrow();
    const first = createOsStore([], "2468");
    first.getState().unlock();
    "2468".split("").forEach((digit) => first.getState().enterDigit(digit));
    expect(first.getState().view).toEqual({ kind: "home" });
    expect(createOsStore([]).getState().view).toEqual({ kind: "lock" });
  });
});
