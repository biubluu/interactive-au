export const osSpring = { type: "spring", stiffness: 380, damping: 36, mass: 0.85 } as const;

export function unlockDistance(viewportHeight: number) {
  return Math.min(120, Math.max(72, viewportHeight * 0.18));
}

export function isUnlockSwipe(offset: { x: number; y: number }, threshold: number) {
  return offset.y <= -threshold && -offset.y > Math.abs(offset.x) * 1.4;
}
