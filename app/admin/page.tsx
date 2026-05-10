"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    global: {
      mealsRescued: number;
      poundsFoodSaved: number;
      co2AvoidedLbs: number;
      sheltersServed: number;
      volunteerMiles: number;
      donationsCompleted: number;
    };
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/me", { credentials: "include" }).then((r) => r.json());
      if (!me.user || me.user.role !== "admin") {
        router.replace("/");
        return;
      }
      const res = await fetch("/api/impact", { credentials: "include" });
      if (res.ok) setStats(await res.json());
    })();
  }, [router]);

  if (!stats) {
    return (
      <div className="card-soft rounded-2xl p-8 text-center" aria-busy="true">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
        <p className="mt-4 text-sm text-[var(--muted)]">Crunching community totals…</p>
      </div>
    );
  }

  const g = stats.global;
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Admin</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">Network pulse</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Live counters from the same impact feed everyone else sees—useful for demos and sanity checks.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile label="Meals rescued (all time)" value={g.mealsRescued} delay={0} />
        <Tile label="Food kept in use (lbs est.)" value={g.poundsFoodSaved} delay={0.05} />
        <Tile label="CO₂ rough avoided (lbs est.)" value={g.co2AvoidedLbs} delay={0.1} />
        <Tile label="Shelters touched" value={g.sheltersServed} delay={0.12} />
        <Tile label="Volunteer miles logged" value={g.volunteerMiles} delay={0.14} />
        <Tile label="Runs marked complete" value={g.donationsCompleted} delay={0.16} />
      </div>
    </div>
  );
}

function Tile({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-soft rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
    >
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--accent)]">{value.toLocaleString()}</p>
    </motion.div>
  );
}
