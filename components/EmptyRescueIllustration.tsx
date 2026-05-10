"use client";

import Image from "next/image";
import { SITE_IMAGES } from "@/lib/site-images";

type Variant = "donor" | "shelter" | "driver-queue" | "driver-run";

/** Empty states — small photo crops instead of line art */
export function EmptyRescueIllustration({ variant }: { variant: Variant }) {
  const donorish = variant === "donor";
  const shelterish = variant === "shelter";
  const src = donorish ? SITE_IMAGES.thumbPacking : shelterish ? SITE_IMAGES.thumbShelter : SITE_IMAGES.thumbRoute;
  return (
    <div
      className="mx-auto h-[120px] w-full max-w-[200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] shadow-sm"
      aria-hidden
    >
      <Image src={src} alt="" width={200} height={120} className="h-full w-full object-cover" sizes="200px" />
    </div>
  );
}
