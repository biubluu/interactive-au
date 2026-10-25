"use client";

import { useEffect, useRef, type ReactNode, type PointerEvent } from "react";
import { animate, motion, useDragControls, useIsPresent, useMotionValue } from "motion/react";
import { isUnlockSwipe, osSpring } from "./os-motion";
import { useOsReducedMotion } from "./use-os-reduced-motion";

type SceneKind = "lock" | "passcode" | "home" | "app";

export function OsScene({ kind, origin, returnFocusId, onGoHome, children }: Readonly<{
  kind: SceneKind;
  origin?: string;
  returnFocusId?: string;
  children: ReactNode;
  onGoHome?: () => void;
}>) {
  const isPresent = useIsPresent();
  const reduced = useOsReducedMotion();
  const homeY = useMotionValue(0);
  const homeDrag = useDragControls();
  const moved = useRef(false);
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

  useEffect(() => {
    if (isPresent) homeY.set(0);
    function cancel() {
      homeDrag.cancel();
      moved.current = true;
      homeY.stop();
      homeY.set(0);
    }
    if (kind === "app") window.addEventListener("blur", cancel);
    return () => { window.removeEventListener("blur", cancel); homeY.stop(); };
  }, [homeDrag, homeY, isPresent, kind]);

  function resetHomeDrag() {
    animate(homeY, 0, reduced ? { duration: 0 } : osSpring);
  }

  function startHomeDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!isPresent || !onGoHome || !event.isPrimary || event.button !== 0) return;
    moved.current = false;
    homeY.stop();
    homeDrag.start(event, { distanceThreshold: 10 });
  }

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
      drag={kind === "app" ? "y" : false} dragControls={homeDrag} dragListener={false}
      dragMomentum={false} dragConstraints={{ top: -130, bottom: 0 }} dragElastic={0.05}
      onDragStart={() => { moved.current = true; }}
      onDragEnd={(event, info) => {
        if (isPresent && event.type !== "pointercancel" && isUnlockSwipe(info.offset, 64)) onGoHome?.();
        else resetHomeDrag();
      }}
      transformTemplate={kind === "app" && reduced ? () => "none" : undefined}
      style={{ y: kind === "app" ? homeY : undefined, transformOrigin: kind === "app" ? origin : "50% 50%" }}
      initial={reduced ? { opacity: 0 } : enter}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={reduced ? { opacity: 0 } : exit}
      transition={reduced ? { duration: 0 } : osSpring}>
      <div className="os-scene-content">{children}</div>
      {kind === "app" && onGoHome && <button className="os-app-home-gesture" data-testid={isPresent ? "app-home-gesture" : undefined}
        aria-label="Go Home using bottom control" onPointerDown={startHomeDrag}
        onPointerCancel={() => { moved.current = true; homeDrag.cancel(); resetHomeDrag(); }}
        onClick={(event) => {
          if (!isPresent || (event.detail !== 0 && moved.current)) return;
          onGoHome();
        }} /> }
    </motion.div>
  );
}
