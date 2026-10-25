import { describe, expect, it } from "vitest";
import { isUnlockSwipe, unlockDistance } from "../../src/features/os/os-motion";

describe("unlock gesture decision", () => {
  it("adapts distance to the viewport without requiring a large swipe on short screens", () => {
    expect(unlockDistance(200)).toBe(72);
    expect(unlockDistance(600)).toBe(108);
    expect(unlockDistance(900)).toBe(120);
  });

  it("requires a deliberate upward distance, not a tap, downward drag, or short flick", () => {
    expect(isUnlockSwipe({ x: 0, y: -96 }, 96)).toBe(true);
    expect(isUnlockSwipe({ x: 0, y: -95 }, 96)).toBe(false);
    expect(isUnlockSwipe({ x: 0, y: 0 }, 96)).toBe(false);
    expect(isUnlockSwipe({ x: 0, y: 150 }, 96)).toBe(false);
  });

  it("rejects a predominantly horizontal diagonal", () => {
    expect(isUnlockSwipe({ x: 120, y: -120 }, 96)).toBe(false);
    expect(isUnlockSwipe({ x: -40, y: -120 }, 96)).toBe(true);
  });
});
