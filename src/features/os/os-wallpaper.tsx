"use client";

import Image from "next/image";
import { useState } from "react";

export type WallpaperChoice = Readonly<{
  image?: `/${string}`;
  position: string;
  fallback: "aurora" | "midnight";
}>;

/** Full-glass decorative artwork; failure reveals the configured CSS fallback. */
export function OsWallpaper({ choice }: Readonly<{ choice: WallpaperChoice }>) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="os-wallpaper" aria-hidden="true" data-testid="os-wallpaper" data-fallback={choice.fallback}>
      <div className="device-wallpaper" data-wallpaper={choice.fallback} />
      {choice.image && !failed && <Image src={choice.image} alt="" fill unoptimized preload sizes="(max-width: 599px) 100vw, 411px"
        className="os-wallpaper-image" style={{ objectFit: "cover", objectPosition: choice.position }} onError={() => setFailed(true)} />}
    </div>
  );
}
