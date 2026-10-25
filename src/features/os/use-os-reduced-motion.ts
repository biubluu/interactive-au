"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const serverSnapshot = () => false;
const clientSnapshot = () => window.matchMedia(query).matches;

function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

/** React uses the server snapshot during hydration, then synchronizes the preference. */
export function useOsReducedMotion() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
