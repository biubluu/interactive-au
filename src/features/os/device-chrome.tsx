"use client";

import "./os.css";
import { useWibClock } from "./wib-clock-provider";
import { displayWibTime } from "./clock-presentation";

/** Simulated indicators only; never read connectivity or battery APIs. */
export function DeviceChrome() {
  const clock = useWibClock();
  return (
    <div className="os-chrome">
      <div className="os-status-bar" role="img" aria-label={`Status: ${clock.time} WIB. Decorative signal, Wi-Fi and battery indicators.`}>
        <span className="os-status-time" data-testid="status-clock">{displayWibTime(clock.time)}</span>
        <span className="os-status-indicators" aria-hidden="true">
          <span className="os-cellular"><i /><i /><i /><i /></span>
          <svg className="os-wifi" viewBox="0 0 20 16" fill="none"><path d="M2 5a13 13 0 0 1 16 0M5 8a8 8 0 0 1 10 0M8 11a3 3 0 0 1 4 0" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" /><circle cx="10" cy="14" r="1.1" fill="currentColor" /></svg>
          <span className="os-battery"><span /></span>
        </span>
      </div>
      <div className="os-home-indicator" aria-hidden="true" />
    </div>
  );
}
