"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; life: number; hue: number };

const MAX = 48;
const DECAY = 0.92;
const SPAWN_EVERY = 2;
let frame = 0;

export function ParticleCursorTrail({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef = useRef<P[]>([]);
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      lastRef.current.x = e.clientX;
      lastRef.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      frame++;
      const { x, y } = lastRef.current;
      const pts = ptsRef.current;
      if (frame % SPAWN_EVERY === 0 && pts.length < MAX) {
        pts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: 1,
          hue: 260 + Math.random() * 35,
        });
      }
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        p.vx *= DECAY;
        p.vy *= DECAY;
        p.x += p.vx;
        p.y += p.vy;
        p.life *= 0.965;
        if (p.life < 0.04) {
          pts.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        g.addColorStop(0, `hsla(${p.hue}, 70%, 58%, ${p.life * 0.35})`);
        g.addColorStop(1, `hsla(${p.hue}, 60%, 45%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + p.life * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      ptsRef.current = [];
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[25] opacity-90"
      aria-hidden
    />
  );
}
