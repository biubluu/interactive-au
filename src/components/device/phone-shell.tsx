import type { ReactNode } from "react";
import "./device.css";

type PhoneShellProps = Readonly<{
  children: ReactNode;
  wallpaper?: "aurora" | "midnight";
}>;

/** Physical presentation only. Children own all future OS and story behavior. */
export function PhoneShell({ children, wallpaper = "aurora" }: PhoneShellProps) {
  return (
    <div className="phone-shell" data-wallpaper={wallpaper}>
      <div className="device-frame" data-testid="device-frame">
        <div className="device-hardware" aria-hidden="true">
          <span className="device-button device-button-action" />
          <span className="device-button device-button-volume-up" />
          <span className="device-button device-button-volume-down" />
          <span className="device-button device-button-power" />
        </div>
        <div className="device-screen" data-testid="device-screen">
          <div className="device-wallpaper" aria-hidden="true" />
          <DynamicIsland />
          <div className="device-content" data-testid="device-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div className="dynamic-island" data-testid="dynamic-island" aria-hidden="true">
      <span className="device-camera" />
    </div>
  );
}
