"use client";

import { useEffect } from "react";

const RADIUS = 80;
const MAX_OFFSET = 14;
const LERP = 0.14;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Props = {
  children: React.ReactNode;
  enabled: boolean;
};

/**
 * Pulls [data-magnetic] elements toward the pointer with damped lerp (field ~80px).
 */
export function MagneticFieldProvider({ children, enabled }: Props) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const els: HTMLElement[] = [];
    const state = new Map<
      HTMLElement,
      { tx: number; ty: number; mx: number; my: number }
    >();

    const refresh = () => {
      els.length = 0;
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((n) => els.push(n));
    };
    refresh();

    const mo = new MutationObserver(refresh);
    mo.observe(document.body, { childList: true, subtree: true });

    const ptr = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      for (const el of els) {
        let st = state.get(el);
        if (!st) {
          st = { tx: 0, ty: 0, mx: 0, my: 0 };
          state.set(el, st);
        }
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = ptr.x - cx;
        const dy = ptr.y - cy;
        const d = Math.hypot(dx, dy);
        let ttx = 0;
        let tty = 0;
        if (d < RADIUS && d > 1e-4) {
          const pull = (RADIUS - d) / RADIUS;
          ttx = (dx / d) * pull * MAX_OFFSET;
          tty = (dy / d) * pull * MAX_OFFSET;
        }
        st.tx = lerp(st.tx, ttx, LERP);
        st.ty = lerp(st.ty, tty, LERP);
        st.mx = lerp(st.mx, st.tx, 0.35);
        st.my = lerp(st.my, st.ty, 0.35);
        el.style.setProperty("--mag-x", st.mx.toFixed(4));
        el.style.setProperty("--mag-y", st.my.toFixed(4));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      mo.disconnect();
      for (const el of els) {
        el.style.removeProperty("--mag-x");
        el.style.removeProperty("--mag-y");
      }
    };
  }, [enabled]);

  return <>{children}</>;
}
