"use client";

import { useEffect, useRef } from "react";
import { getLiquidHoverBoost } from "./liquid-state";

/**
 * Global SVG filter: feTurbulence baseFrequency morphs over time; intensifies when a .liquid-morph is hovered.
 */
export function LiquidFilterDefs() {
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const el = turbRef.current;
    if (!el) return;

    let t = 0;
    let raf = 0;
    const loop = () => {
      t += 0.012;
      const hover = getLiquidHoverBoost();
      const base = 0.016 + Math.sin(t) * 0.005 + hover * 0.024;
      el.setAttribute("baseFrequency", `${base.toFixed(4)} ${(base * 1.08).toFixed(4)}`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      className="pointer-events-none fixed h-0 w-0 opacity-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="rescueroute-liquid" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.02 0.022"
            numOctaves="3"
            seed="42"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
