"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { DIETARY_LABELS, FOOD_CATEGORY_LABELS, STORAGE_LABELS } from "@/lib/constants";
import { sortDonationsUrgentFirst, isDonationUrgent } from "@/lib/pickup-urgency";
import { EmptyRescueIllustration } from "@/components/EmptyRescueIllustration";
import { SITE_IMAGES } from "@/lib/site-images";
import type { DietaryTag, FoodCategory, StorageType } from "@/lib/types";

type Donation = {
  id: string;
  title: string;
  status: string;
  foodCategory: FoodCategory;
  quantityDescription: string;
  estimatedMeals: number;
  pickupAddress: string;
  earliestPickup: string;
  latestPickup: string;
  expirationDeadline: string;
  storageType: StorageType;
  dietaryTags: DietaryTag[];
  createdAt: string;
};

function EmptyDonations() {
  return (
    <li className="dispatch-card rounded-2xl px-6 py-12 text-center">
      <EmptyRescueIllustration variant="donor" />
      <p className="mt-4 text-lg font-semibold text-[var(--text)]">No rescues yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
        New donations will appear here soon—when you’re ready, post a food rescue and we’ll broadcast the pickup
        window.
      </p>
      <Link href="/donor/new" className="btn-primary interactive-glow mt-6 inline-flex px-6 py-2.5 text-sm">
        Post a food rescue
      </Link>
    </li>
  );
}

export default function DonorDashboard() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<{
    global: { mealsRescued: number; poundsFoodSaved: number; co2AvoidedLbs: number };
    personal?: { mealsYouRescued?: number; donationsYouCompleted?: number };
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/me", { credentials: "include" }).then((r) => r.json());
      if (!me.user || me.user.role !== "donor") {
        router.replace("/login");
        return;
      }
      const [dRes, iRes] = await Promise.all([
        fetch("/api/donations", { credentials: "include" }),
        fetch("/api/impact", { credentials: "include" }),
      ]);
      if (dRes.ok) {
        const j = (await dRes.json()) as { donations: Donation[] };
        setDonations(j.donations);
      }
      if (iRes.ok) setImpact(await iRes.json());
    })();
  }, [router]);

  const sorted = useMemo(() => sortDonationsUrgentFirst(donations), [donations]);

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-soft relative overflow-hidden rounded-[1.75rem]"
      >
        <div className="relative h-40 md:h-48">
          <Image
            src={SITE_IMAGES.donorBanner}
            alt="Professional kitchen pass with plated dishes and service in motion."
            fill
            className="object-cover object-center opacity-95"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pb-8 pt-0 md:px-10">
          <div className="-mt-14 max-w-xl md:-mt-20">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Dispatch · your kitchen</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
              Your rescue board
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
              Post what’s left at closing, watch shelters find nearby donations, and see meals and CO₂ you helped keep
              moving.
            </p>
          </div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="shrink-0">
            <Link href="/donor/new" className="btn-primary interactive-glow inline-flex px-6 py-3 text-sm">
              Post a food rescue
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {impact && (
        <section className="px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Impact snapshot</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Meals you helped rescue" value={impact.personal?.mealsYouRescued ?? 0} delay={0} />
            <StatCard label="Meals across Replate" value={impact.global.mealsRescued} delay={0.05} />
            <StatCard label="Food kept out of the bin (lbs)" value={impact.global.poundsFoodSaved} delay={0.1} />
            <StatCard label="Rough CO₂ avoided (lbs est.)" value={impact.global.co2AvoidedLbs} delay={0.15} />
          </div>
        </section>
      )}

      <section className="px-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Active &amp; past rescues</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Each card is a dispatch slip—open one for maps, pickup window, and food safety notes.
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {donations.length === 0 && <EmptyDonations />}
          {sorted.map((d, i) => {
            const urgent = isDonationUrgent(d);
            const statusLabel = d.status.replace("_", " ");
            return (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ y: -2 }}
                className="dispatch-card flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {urgent && <span className="badge-urgent">Urgent</span>}
                    <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--text)] ring-1 ring-[var(--border)]">
                      {statusLabel}
                    </span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                      {STORAGE_LABELS[d.storageType]}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-[var(--text)]">{d.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--text)]">{d.estimatedMeals} meals</span>
                    {" · "}
                    {FOOD_CATEGORY_LABELS[d.foodCategory]} · {d.quantityDescription}
                  </p>
                  <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                    <span>
                      <span className="font-medium text-[var(--text)]">Pickup window:</span>{" "}
                      {new Date(d.earliestPickup).toLocaleString()} – {new Date(d.latestPickup).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    <span className="font-medium text-[var(--text)]">📍</span> {d.pickupAddress}
                  </p>
                  {d.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {d.dietaryTags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)] ring-1 ring-[var(--border)]"
                        >
                          {DIETARY_LABELS[t]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/donation/${d.id}`}
                  className="btn-secondary shrink-0 self-start px-4 py-2 text-sm sm:self-center"
                >
                  Open details
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
