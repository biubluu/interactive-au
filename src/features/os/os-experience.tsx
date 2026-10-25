"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useStore } from "zustand";
import type { ExperienceConfig, PlaceholderApp } from "./experience-config";
import { createOsStore } from "./os-store";
import { OsIcon } from "./os-icons";
import "./os.css";

export function OsExperience({ config }: Readonly<{ config: ExperienceConfig }>) {
  const [store] = useState(() => createOsStore(config.apps.map((app) => app.id)));
  const view = useStore(store, (state) => state.view);
  const [flashlight, setFlashlight] = useState(false);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const unlockButton = useRef<HTMLButtonElement>(null);
  const appButtons = useRef(new Map<string, HTMLButtonElement>());
  const previousView = useRef(view);
  const selectedApp = view.kind === "app" ? config.apps.find((app) => app.id === view.appId) : undefined;

  useEffect(() => {
    const previous = previousView.current;
    if (previous === view) return;
    previousView.current = view;
    if (view.kind === "lock") unlockButton.current?.focus();
    else if (view.kind === "home" && previous.kind === "app") appButtons.current.get(previous.appId)?.focus();
    else heading.current?.focus();
  }, [view]);

  function renderApp(app: PlaceholderApp, dock = false) {
    return (
      <button key={app.id} ref={(element) => { if (element) appButtons.current.set(app.id, element); else appButtons.current.delete(app.id); }}
        className={`os-app-button${dock ? " os-dock-app" : ""}`} aria-label={`Open ${app.name} — PLACEHOLDER`}
        onClick={() => store.getState().openApp(app.id)}>
        <span className="os-app-icon" style={{ "--app-color": app.color } as CSSProperties}><OsIcon name={app.icon} /></span>
        {!dock && <span className="os-app-label">{app.name}<span>Placeholder</span></span>}
      </button>
    );
  }

  return (
    <div className={`os-view os-${view.kind}`} data-testid={`os-${view.kind}`}>
      {view.kind === "lock" && <>
        <header className="os-lock-clock">
          <span className="os-lock-symbol"><OsIcon name="lock" /></span>
          <p className="os-date"><time dateTime={config.dateTime.slice(0, 10)}>{config.date}</time></p>
          <h1 className="os-clock" aria-label={`Lock Screen, ${config.clock}`}><time dateTime={config.dateTime}>{config.clock}</time></h1>
          <p className="os-placeholder-label">PLACEHOLDER EXPERIENCE</p>
        </header>
        <p role="status" className="os-shortcut-notice">{notice}</p>
        <div className="os-lock-bottom">
          <div className="os-shortcuts">
            <button className="os-shortcut" aria-label="Simulate flashlight" aria-pressed={flashlight} onClick={() => { setFlashlight(!flashlight); setNotice(`PLACEHOLDER: simulated flashlight ${flashlight ? "off" : "on"}.`); }}><OsIcon name="flashlight" /></button>
            <button className="os-shortcut" aria-label="Simulate camera" onClick={() => setNotice("PLACEHOLDER: camera preview is simulated. No camera is accessed.")}><OsIcon name="camera" /></button>
          </div>
          <button ref={unlockButton} className="os-unlock" onClick={() => { setNotice(""); setFlashlight(false); store.getState().unlock(); }}>
            <OsIcon name="arrow" /><span>Unlock</span>
          </button>
        </div>
      </>}

      {view.kind === "home" && <>
        <header className="os-home-header">
          <h1 ref={heading} tabIndex={-1} className="os-placeholder-label">Home Screen<span>PLACEHOLDER APPS</span></h1>
          <button className="os-lock-control" aria-label="Lock device" onClick={() => store.getState().lock()}><OsIcon name="lock" /></button>
        </header>
        <div className="os-app-grid" aria-label="Placeholder applications">{config.apps.filter((app) => app.placement === "grid").map((app) => renderApp(app))}</div>
        <div className="os-dock-area">
          <p className="os-dock-caption">PLACEHOLDER DOCK</p>
          <nav className="os-dock" aria-label="Placeholder dock">{config.apps.filter((app) => app.placement === "dock").map((app) => renderApp(app, true))}</nav>
        </div>
      </>}

      {selectedApp && <div className="os-app-preview">
        <button className="os-back" onClick={() => store.getState().goHome()}>‹ Back to Home</button>
        <span className="os-preview-icon os-app-icon" style={{ "--app-color": selectedApp.color } as CSSProperties}><OsIcon name={selectedApp.icon} /></span>
        <h1 ref={heading} tabIndex={-1}>{selectedApp.name}</h1>
        <p className="os-placeholder-label">PLACEHOLDER APP</p>
        <p>This is a visual app placeholder. No app functionality, device permissions, or story events are available.</p>
      </div>}
    </div>
  );
}
