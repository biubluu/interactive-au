import { PhoneShell } from "../components/device/phone-shell";
import { DeviceChrome } from "../features/os/device-chrome";
import { experienceConfig } from "../features/os/experience-config";
import { OsExperience } from "../features/os/os-experience";
import { WibClockProvider } from "../features/os/wib-clock-provider";

export default function Page() {
  return (
    <main className="device-stage">
      <WibClockProvider clock={experienceConfig.storyClock}>
        <PhoneShell contentPresentation="full" wallpaper={experienceConfig.homeWallpaper.fallback} overlay={<DeviceChrome />}>
          <OsExperience config={experienceConfig} />
        </PhoneShell>
      </WibClockProvider>
    </main>
  );
}
