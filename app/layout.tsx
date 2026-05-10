import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ensureDemoSeed } from "@/lib/init";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CreativeShell } from "@/components/creative/CreativeShell";
import { LiquidFilterDefs } from "@/components/creative/LiquidFilterDefs";
import { Nav } from "@/components/Nav";
import "./globals.css";

ensureDemoSeed();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interKinetic = Inter({
  variable: "--font-kinetic",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Replate — Community food rescue network",
  description:
    "Warm cream kitchens meet live maps: post a food rescue, find nearby donations as a shelter, or volunteer to deliver while it’s still safe to eat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interKinetic.variable} relative min-h-screen font-sans antialiased`}
      >
        <LiquidFilterDefs />
        <CreativeShell>
          <AmbientBackground />
          <div className="relative z-10">
            <Nav />
            <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 sm:pt-12">{children}</main>
          </div>
        </CreativeShell>
      </body>
    </html>
  );
}
