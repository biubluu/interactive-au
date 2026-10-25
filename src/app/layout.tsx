import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../components/glass-controls.css";

export const metadata: Metadata = {
  title: "Interactive AU | Fictional Phone Experience",
  description: "An interactive fictional phone experience.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
