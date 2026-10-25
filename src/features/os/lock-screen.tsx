"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { animate, motion, useDragControls, useIsPresent, useMotionValue, useTransform } from "motion/react";
import type { ExperienceConfig } from "./experience-config";
import { OsIcon } from "./os-icons";
import { isUnlockSwipe, osSpring, unlockDistance } from "./os-motion";
import { useOsReducedMotion } from "./use-os-reduced-motion";

export function LockScreen({ config, onUnlock }: Readonly<{ config: ExperienceConfig; onUnlock: () => void }>) {
  const reduced = useOsReducedMotion();
  const isPresent = useIsPresent();
  const controls = useDragControls();
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, (value) => reduced ? 1 : Math.max(0.25, 1 + value / 340));
  const threshold = useRef(96);
  const [flashlight, setFlashlight] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // AnimatePresence can revive a scene while its previous exit is still running.
    if (isPresent) dragY.set(0);
    return () => dragY.stop();
  }, [dragY, isPresent]);

  useEffect(() => {
    function cancelOnBlur() {
      controls.cancel();
      dragY.stop();
      dragY.set(0);
    }
    window.addEventListener("blur", cancelOnBlur);
    return () => window.removeEventListener("blur", cancelOnBlur);
  }, [controls, dragY]);

  function commitUnlock() {
    setFlashlight(false);
    setNotice("");
    onUnlock();
  }

  function reset() {
    animate(dragY, 0, reduced ? { duration: 0 } : osSpring);
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const viewport = event.currentTarget.closest(".device-content");
    threshold.current = unlockDistance(viewport?.clientHeight ?? 600);
    dragY.stop();
    controls.start(event, { distanceThreshold: 10 });
  }

  return (
    <motion.div className="os-lock-panel" data-testid="lock-panel"
      drag="y" dragControls={controls} dragListener={false} dragMomentum={false}
      dragConstraints={{ top: -260, bottom: 0 }} dragElastic={0.08}
      style={{ y: dragY, opacity }}
      transformTemplate={reduced ? () => "none" : undefined}
      onDragEnd={(event, info) => {
        if (event.type !== "pointercancel" && isUnlockSwipe(info.offset, threshold.current)) commitUnlock();
        else reset();
      }}>
      <header className="os-lock-clock">
        <span className="os-lock-symbol"><OsIcon name="lock" /></span>
        <p className="os-date"><time dateTime={config.dateTime.slice(0, 10)}>{config.date}</time></p>
        <h1 className="os-clock" aria-label={`Lock Screen, ${config.clock}`}><time dateTime={config.dateTime}>{config.clock}</time></h1>
        <p className="os-placeholder-label">PLACEHOLDER EXPERIENCE</p>
      </header>
      <p role="status" className="os-shortcut-notice">{notice}</p>
      <div className="os-lock-bottom">
        <div className="os-shortcuts">
          <motion.button whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }} className="os-shortcut"
            aria-label="Simulate flashlight" aria-pressed={flashlight}
            onClick={() => { setFlashlight(!flashlight); setNotice(`PLACEHOLDER: simulated flashlight ${flashlight ? "off" : "on"}.`); }}>
            <OsIcon name="flashlight" />
          </motion.button>
          <motion.button whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }} className="os-shortcut"
            aria-label="Simulate camera" onClick={() => setNotice("PLACEHOLDER: camera preview is simulated. No camera is accessed.")}>
            <OsIcon name="camera" />
          </motion.button>
        </div>
        <div className="os-swipe-zone" data-testid="unlock-gesture" aria-hidden="true"
          onPointerDown={startSwipe} onPointerCancel={() => { controls.cancel(); reset(); }}>
          <OsIcon name="arrow" /><span>Swipe up to unlock</span>
        </div>
        <button className="os-unlock" onClick={commitUnlock}>Unlock</button>
      </div>
    </motion.div>
  );
}
