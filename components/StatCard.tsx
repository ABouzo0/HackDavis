"use client";

import { motion, useReducedMotion } from "framer-motion";

export function StatCard({
  label,
  value,
  delay = 0,
  tone = "green",
}: {
  label: string;
  value: string | number;
  delay?: number;
  /** `highlight` uses the 10% accent for numbers that should pop (e.g. urgency). */
  tone?: "green" | "highlight";
}) {
  const reduce = useReducedMotion();
  const valueClass =
    tone === "highlight" ? "text-[var(--highlight-ink)]" : "text-[var(--accent)]";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={reduce ? {} : { scale: 1.02, y: -3 }}
      className={`stat-card rounded-2xl p-5 ${tone === "highlight" ? "border-[var(--highlight)]/30 bg-[var(--highlight-soft)]/40" : ""}`}
    >
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${valueClass}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </motion.div>
  );
}
