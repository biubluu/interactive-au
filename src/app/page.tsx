import { PhoneShell } from "../components/device/phone-shell";
import { DeviceChrome } from "../features/os/device-chrome";
import { experienceConfig } from "../features/os/experience-config";
import { OsExperience } from "../features/os/os-experience";

export default function Page() {
  return (
    <main className="device-stage">
      <PhoneShell wallpaper={experienceConfig.wallpaper} overlay={<DeviceChrome clock={experienceConfig.clock} />}>
        <OsExperience config={experienceConfig} />
      </PhoneShell>
    </main>
  );
}
