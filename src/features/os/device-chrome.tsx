"use client";

import "./os.css";
import { UiIcon } from "../../components/ui-icon";
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
          <svg className="os-signal" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx=".8" /><rect x="4.3" y="5.5" width="3" height="6.5" rx=".8" /><rect x="8.6" y="3" width="3" height="9" rx=".8" /><rect x="12.9" width="3" height="12" rx=".8" /></svg>
          <span className="os-status-wifi"><UiIcon name="wifi" viewBox="0 7 56 44" /></span>
          <span className="os-status-battery"><UiIcon name="battery" viewBox="0 12 56 32" /></span>
        </span>
      </div>
      <div className="os-home-indicator" aria-hidden="true" />
    </div>
  );
}
