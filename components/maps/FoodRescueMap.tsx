"use client";

import dynamic from "next/dynamic";

export type { MapMarkerPoint } from "./FoodRescueMapInner";

const loader = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  ? () => import("./FoodRescueMap3DInner")
  : () => import("./FoodRescueMapInner");

/** 3D terrain + tilt when `NEXT_PUBLIC_MAPBOX_TOKEN` is set; otherwise OpenStreetMap (Leaflet). */
export const FoodRescueMap = dynamic(loader, {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)] md:h-[380px]">
      Loading map…
    </div>
  ),
});
