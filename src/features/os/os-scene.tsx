"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useIsPresent } from "motion/react";
import { osSpring } from "./os-motion";
import { useOsReducedMotion } from "./use-os-reduced-motion";

type SceneKind = "lock" | "passcode" | "home" | "app";

export function OsScene({ kind, origin, returnFocusId, children }: Readonly<{
  kind: SceneKind;
  origin?: string;
  returnFocusId?: string;
  children: ReactNode;
}>) {
  const isPresent = useIsPresent();
  const reduced = useOsReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPresent) return;
    const element = root.current;
    const app = kind === "home" && returnFocusId
      ? Array.from(element?.querySelectorAll<HTMLButtonElement>("[data-app-id]") ?? [])
          .find((button) => button.dataset.appId === returnFocusId)
      : undefined;
    const target = app ?? element?.querySelector<HTMLElement>(kind === "lock" ? ".os-unlock" : ".os-scene-heading");
    // Keep initial SSR load from stealing focus; subsequent mounted scenes receive it.
    if (element?.closest("[data-has-navigated='true']")) target?.focus();
  }, [isPresent, kind, returnFocusId]);

  const enter = kind === "lock"
    ? { y: -64, scale: 1, opacity: 0 }
    : { y: 0, scale: kind === "app" ? 0.18 : 1.035, opacity: 0 };
  const exit = kind === "lock"
    ? { y: -260, scale: 1, opacity: 0 }
    : { y: 0, scale: kind === "app" ? 0.18 : 0.97, opacity: 0 };

  return (
    <motion.div ref={root} className={`os-view os-scene os-${kind}`}
      data-testid={isPresent ? `os-${kind}` : undefined}
      data-exiting={!isPresent} data-motion={reduced ? "reduced" : "full"}
      inert={!isPresent} aria-hidden={!isPresent ? true : undefined}
      style={{ transformOrigin: kind === "app" ? origin : "50% 50%" }}
      initial={reduced ? { opacity: 0 } : enter}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={reduced ? { opacity: 0 } : exit}
      transition={reduced ? { duration: 0 } : osSpring}>
      <div className="os-scene-content">{children}</div>
    </motion.div>
  );
}
