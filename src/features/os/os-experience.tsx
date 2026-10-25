"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useStore } from "zustand";
import type { ExperienceConfig, PlaceholderApp } from "./experience-config";
import { createOsStore } from "./os-store";
import { OsIcon } from "./os-icons";
import { LockScreen } from "./lock-screen";
import { OsScene } from "./os-scene";
import { osSpring } from "./os-motion";
import { useOsReducedMotion } from "./use-os-reduced-motion";
import { PasscodeScreen } from "./passcode-screen";
import { AppArtwork } from "./app-artwork";
import { OsWallpaper } from "./os-wallpaper";
import "./os.css";

export function OsExperience({ config }: Readonly<{ config: ExperienceConfig }>) {
  const [store] = useState(() => createOsStore(config.apps.map((app) => app.id), config.simulationPin));
  const view = useStore(store, (state) => state.view);
  const reduced = useOsReducedMotion();
  const [launch, setLaunch] = useState<{ appId: string; origin: string } | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const selectedApp = view.kind === "app" ? config.apps.find((app) => app.id === view.appId) : undefined;
  const wallpaper = view.kind === "lock" || view.kind === "passcode" ? config.lockScreen.wallpaper : config.homeWallpaper;

  function unlock() {
    if (store.getState().view.kind !== "lock") return;
    setHasNavigated(true);
    setLaunch(null);
    store.getState().unlock();
  }

  function openApp(event: MouseEvent<HTMLButtonElement>, appId: string) {
    if (store.getState().view.kind !== "home") return;
    const icon = event.currentTarget.getBoundingClientRect();
    const surface = event.currentTarget.closest(".os-scene")?.getBoundingClientRect();
    const origin = surface
      ? `${(icon.x + icon.width / 2 - surface.x) / surface.width * 100}% ${(icon.y + icon.height / 2 - surface.y) / surface.height * 100}%`
      : "50% 50%";
    setLaunch({ appId, origin });
    store.getState().openApp(appId);
  }

  function renderApp(app: PlaceholderApp, dock = false) {
    return (
      <motion.button key={app.id} data-app-id={app.id} title={app.name}
        className={`os-app-button${dock ? " os-dock-app" : ""}`}
        aria-label={`Open ${app.name}`}
        whileTap={reduced ? { opacity: 0.7 } : { scale: 0.92 }}
        transition={reduced ? { duration: 0 } : osSpring}
        onClick={(event) => openApp(event, app.id)}>
        <span className="os-app-icon" style={{ "--app-color": app.color } as CSSProperties}><AppArtwork name={app.icon} /></span>
        {!dock && <span className="os-app-label">{app.name}</span>}
      </motion.button>
    );
  }

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <div className="os-scenes" data-has-navigated={hasNavigated}>
        <OsWallpaper key={`${wallpaper.image ?? "css"}:${wallpaper.fallback}`} choice={wallpaper} />
        <AnimatePresence initial={false} mode="sync">
          <OsScene key={view.kind} kind={view.kind} origin={launch?.origin} returnFocusId={view.kind === "home" ? launch?.appId : undefined}>
            {view.kind === "lock" && <LockScreen onUnlock={unlock} clockColor={config.lockScreen.clockColor} dateColor={config.lockScreen.dateColor} />}
            {view.kind === "passcode" && <PasscodeScreen digits={view.digits} error={view.error}
              onDigit={store.getState().enterDigit} onDelete={store.getState().deleteDigit} onCancel={store.getState().lock} />}
            {view.kind === "home" && <>
              <header className="os-home-header">
                <h1 tabIndex={-1} className="os-scene-heading sr-only">Home Screen</h1>
                <button className="os-lock-control" aria-label="Lock device" onClick={() => {
                  if (store.getState().view.kind !== "home") return;
                  setLaunch(null);
                  store.getState().lock();
                }}><OsIcon name="lock" /></button>
              </header>
              <div className="os-app-grid" aria-label="Applications">{config.apps.filter((app) => app.placement === "grid").map((app) => renderApp(app))}</div>
              <div className="os-dock-area">
                <nav className="os-dock" aria-label="Dock">{config.apps.filter((app) => app.placement === "dock").map((app) => renderApp(app, true))}</nav>
              </div>
            </>}
            {selectedApp && <div className="os-app-preview">
              <button className="os-back" onClick={() => store.getState().goHome()}>‹ Back to Home</button>
              <span className="os-preview-icon os-app-icon" style={{ "--app-color": selectedApp.color } as CSSProperties}><AppArtwork name={selectedApp.icon} /></span>
              <h1 className="os-scene-heading" tabIndex={-1}>{selectedApp.name}</h1>
              {/* Demo placeholder only: no real app functionality or story content. */}
              <p>Nothing here yet.</p>
            </div>}
          </OsScene>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
