"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { animate, motion, useDragControls, useIsPresent, useMotionValue, useTransform } from "motion/react";
import { OsIcon } from "./os-icons";
import { isUnlockSwipe, osSpring, unlockDistance } from "./os-motion";
import { useOsReducedMotion } from "./use-os-reduced-motion";
import { useWibClock } from "./wib-clock-provider";

export function LockScreen({ onUnlock, clockColor = "#ffffff", dateColor = "#ffffff" }: Readonly<{
  onUnlock: () => void; clockColor?: string; dateColor?: string;
}>) {
  const clock = useWibClock();
  const reduced = useOsReducedMotion();
  const isPresent = useIsPresent();
  const controls = useDragControls();
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, (value) => reduced ? 1 : Math.max(0.25, 1 + value / 340));
  const threshold = useRef(96);
  const [flashlight, setFlashlight] = useState(false);
  const [camera, setCamera] = useState(false);
  const gestureMoved = useRef(false);

  useEffect(() => {
    // AnimatePresence can revive a scene while its previous exit is still running.
    if (isPresent) dragY.set(0);
    return () => dragY.stop();
  }, [dragY, isPresent]);

  useEffect(() => {
    function cancelOnBlur() {
      controls.cancel();
      gestureMoved.current = true;
      dragY.stop();
      dragY.set(0);
    }
    window.addEventListener("blur", cancelOnBlur);
    return () => window.removeEventListener("blur", cancelOnBlur);
  }, [controls, dragY]);

  function commitUnlock() {
    setFlashlight(false);
    setCamera(false);
    onUnlock();
  }

  function reset() {
    animate(dragY, 0, reduced ? { duration: 0 } : osSpring);
  }

  function startSwipe(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    gestureMoved.current = false;
    const viewport = event.currentTarget.closest(".os-lock-panel");
    threshold.current = unlockDistance(viewport?.clientHeight ?? 600);
    dragY.stop();
    controls.start(event, { distanceThreshold: 10 });
  }

  return (
    <motion.div className="os-lock-panel" data-testid="lock-panel"
      drag="y" dragControls={controls} dragListener={false} dragMomentum={false}
      dragConstraints={{ top: -260, bottom: 0 }} dragElastic={0.08}
      style={{ y: dragY, opacity, ...({ "--lock-clock-color": clockColor, "--lock-date-color": dateColor } as CSSProperties) }}
      transformTemplate={reduced ? () => "none" : undefined}
      onDragStart={() => { gestureMoved.current = true; }}
      onDragEnd={(event, info) => {
        if (event.type !== "pointercancel" && isUnlockSwipe(info.offset, threshold.current)) commitUnlock();
        else reset();
      }}>
      <header className="os-lock-clock">
          <p className="os-date"><time dateTime={clock.dateKey || undefined}>{clock.date}</time></p>
          <h1 className="os-clock" aria-label={`Lock Screen, ${clock.time} WIB`}><time data-testid="lock-clock" dateTime={clock.dateTime}>{clock.time}</time></h1>
      </header>
      <div className="os-lock-bottom">
        <div className="os-shortcuts">
          <motion.button whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }} className="os-shortcut"
            aria-label="Flashlight shortcut (visual only)" aria-pressed={flashlight}
            onClick={() => setFlashlight(!flashlight)}>
            <OsIcon name="flashlight" />
          </motion.button>
          <motion.button whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }} className="os-shortcut"
            aria-label="Camera shortcut (visual only)" aria-pressed={camera} onClick={() => setCamera(!camera)}>
            <OsIcon name="camera" />
          </motion.button>
        </div>
        <button className="os-swipe-zone os-unlock" data-testid="unlock-gesture" aria-label="Enter passcode"
          onPointerDown={startSwipe} onPointerCancel={() => { gestureMoved.current = true; controls.cancel(); reset(); }}
          onClick={(event) => {
            if (event.detail !== 0 && gestureMoved.current) { event.preventDefault(); return; }
            commitUnlock();
          }}>
        </button>
      </div>
    </motion.div>
  );
}
