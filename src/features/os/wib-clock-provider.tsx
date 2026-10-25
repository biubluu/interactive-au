"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { WibClock } from "./wib-clock";

const ClockContext = createContext<WibClock | null>(null);

// The historical name is retained; the story clock has no live scheduling.
export function WibClockProvider({ children, clock }: Readonly<{ children: ReactNode; clock: WibClock }>) {
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>;
}

export function useWibClock() {
  const clock = useContext(ClockContext);
  if (!clock) throw new Error("Clock consumers require WibClockProvider");
  return clock;
}
