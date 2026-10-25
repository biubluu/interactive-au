"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initialWibClock, startWibClock, type WibClock } from "./wib-clock";

const ClockContext = createContext<WibClock>(initialWibClock);

export function WibClockProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [clock, setClock] = useState(initialWibClock);
  useEffect(() => startWibClock(setClock), []);
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>;
}

export function useWibClock() {
  return useContext(ClockContext);
}
