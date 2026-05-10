"use client";

import { useEffect, useState } from "react";
import { MagneticFieldProvider } from "./MagneticFieldProvider";
import { ParticleCursorTrail } from "./ParticleCursorTrail";

export function CreativeShell({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fxOn = !reducedMotion;

  return (
    <MagneticFieldProvider enabled={fxOn}>
      {fxOn ? <ParticleCursorTrail enabled /> : null}
      {children}
    </MagneticFieldProvider>
  );
}
