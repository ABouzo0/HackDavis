"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DIETARY_LABELS, FOOD_CATEGORY_LABELS, NEED_LEVELS, STORAGE_LABELS } from "@/lib/constants";
import { isDonationUrgent, sortDonationsUrgentFirst } from "@/lib/pickup-urgency";
import { EmptyRescueIllustration } from "@/components/EmptyRescueIllustration";
import { SITE_IMAGES } from "@/lib/site-images";
import type { DietaryTag, FoodCategory, StorageType } from "@/lib/types";

type Donation = {
  id: string;
  title: string;
  status: string;
  foodCategory: FoodCategory;
  estimatedMeals: number;
  pickupAddress: string;
  earliestPickup: string;
  latestPickup: string;
  expirationDeadline: string;
  storageType: StorageType;
  dietaryTags: DietaryTag[];
  quantityDescription: string;
  shelterId?: string;
  driverId?: string;
};

type NeedForm = {
  needLevel: string;
  mealsNeeded: number;
  acceptedFoodCategories: string[];
  dietaryRestrictions: string[];
  storageCapacityAvailable: number;
  latestAcceptableDelivery: string;
  notes: string;
};

export default function ShelterDashboard() {
  const router = useRouter();
  const [meId, setMeId] = useState<string>("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [insight, setInsight] = useState<{ needScore: number; band: string } | null>(null);
  const [need, setNeed] = useState<NeedForm | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/me", { credentials: "include" }).then((r) => r.json());
      if (!me.user || me.user.role !== "shelter") {
        router.replace("/login");
        return;
      }
      setMeId(me.user.id);
      const [dRes, iRes, nRes] = await Promise.all([
        fetch("/api/donations", { credentials: "include" }),
        fetch("/api/shelter/insight", { credentials: "include" }),
        fetch("/api/shelter/need", { credentials: "include" }),
      ]);
      if (dRes.ok) {
        const j = (await dRes.json()) as { donations: Donation[] };
        setDonations(j.donations);
      }
      if (iRes.ok) setInsight(await iRes.json());
      if (nRes.ok) {
        const j = (await nRes.json()) as { need: NeedForm | null };
        if (j.need) {
          setNeed({
            needLevel: j.need.needLevel,
            mealsNeeded: j.need.mealsNeeded,
            acceptedFoodCategories: j.need.acceptedFoodCategories,
            dietaryRestrictions: j.need.dietaryRestrictions,
            storageCapacityAvailable: j.need.storageCapacityAvailable,
            latestAcceptableDelivery: toLocal(j.need.latestAcceptableDelivery),
            notes: j.need.notes,
          });
        } else {
          const later = new Date(Date.now() + 8 * 3600 * 1000);
          setNeed({
            needLevel: "high",
            mealsNeeded: 60,
            acceptedFoodCategories: ["prepared_meals", "produce"],
            dietaryRestrictions: [],
            storageCapacityAvailable: 100,
            latestAcceptableDelivery: toLocal(later.toISOString()),
            notes: "",
          });
        }
      }
    })();
  }, [router]);

  const sorted = useMemo(() => sortDonationsUrgentFirst(donations), [donations]);

  async function saveNeed(e: React.FormEvent) {
    e.preventDefault();
    if (!need) return;
    await fetch("/api/shelter/need", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...need,
        latestAcceptableDelivery: new Date(need.latestAcceptableDelivery).toISOString(),
      }),
    });
    const iRes = await fetch("/api/shelter/insight", { credentials: "include" });
    if (iRes.ok) setInsight(await iRes.json());
  }

  async function claim(id: string) {
    const res = await fetch(`/api/donations/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const dRes = await fetch("/api/donations", { credentials: "include" });
      if (dRes.ok) setDonations(((await dRes.json()) as { donations: Donation[] }).donations);
    }
  }

  async function unmatch(id: string) {
    const res = await fetch(`/api/donations/${id}/unassign`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const dRes = await fetch("/api/donations", { credentials: "include" });
      if (dRes.ok) setDonations(((await dRes.json()) as { donations: Donation[] }).donations);
    }
  }

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-soft relative overflow-hidden rounded-[1.75rem]"
      >
        <div className="relative h-36 md:h-44">
          <Image
            src={SITE_IMAGES.shelterBanner}
            alt="Shared table filled with fresh salads and dishes for a community meal."
            fill
            className="object-cover object-center opacity-95"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/88 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        </div>
        <div className="relative -mt-12 px-6 pb-8 pt-0 md:-mt-14 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Dispatch · shelter</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
            Find nearby donations
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            Share what you can store and when—then claim rescues that fit your crew before the pickup window closes.
          </p>
        </div>
      </motion.div>

      {insight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-soft relative overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--surface-2)] via-[var(--surface)] to-[var(--bg-elevated)] p-6 shadow-md md:p-8"
        >
          <p className="text-sm font-medium text-[var(--muted)]">Today&apos;s need signal</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] opacity-90">
            A simple score from your last report—higher usually means more urgency on our side.
          </p>
          <p className="mt-4 text-4xl font-bold tabular-nums text-[var(--highlight-ink)]">{insight.needScore}</p>
          <p className="mt-3 inline-flex rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text)] ring-1 ring-[var(--border)]">
            <span className="text-[var(--muted)]">Band</span>
            <span className="ml-2 capitalize font-medium text-[var(--accent)]">{insight.band}</span>
          </p>
        </motion.div>
      )}

      {need && (
        <form onSubmit={(e) => void saveNeed(e)} className="card-soft space-y-5 rounded-2xl p-6 md:p-8">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">What you need right now</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Update anytime—donors and drivers see fresher matches when this stays honest.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Urgency</span>
              <select
                className="select-field mt-1.5 w-full"
                value={need.needLevel}
                onChange={(e) => setNeed({ ...need, needLevel: e.target.value })}
              >
                {NEED_LEVELS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Meals you&apos;re hoping for</span>
              <input
                type="number"
                className="input-field mt-1.5 w-full"
                value={need.mealsNeeded}
                onChange={(e) => setNeed({ ...need, mealsNeeded: +e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Cold / dry storage you have free (units)</span>
              <input
                type="number"
                className="input-field mt-1.5 w-full"
                value={need.storageCapacityAvailable}
                onChange={(e) => setNeed({ ...need, storageCapacityAvailable: +e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Latest you can accept a drop</span>
              <input
                type="datetime-local"
                className="input-field mt-1.5 w-full"
                value={need.latestAcceptableDelivery}
                onChange={(e) => setNeed({ ...need, latestAcceptableDelivery: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Notes for drivers &amp; donors</span>
            <textarea
              className="input-field mt-1.5 min-h-[5rem] w-full resize-y"
              rows={2}
              value={need.notes}
              placeholder="Loading dock hours, allergen policies, who to ask for…"
              onChange={(e) => setNeed({ ...need, notes: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary interactive-glow px-6 py-3">
            Save and continue
          </button>
        </form>
      )}

      <section className="px-1">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Incoming rescues</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Urgent slips float to the top—tap through for maps, pickup window, and food safety notes.
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {donations.length === 0 && (
            <li className="dispatch-card rounded-2xl px-6 py-12 text-center">
              <EmptyRescueIllustration variant="shelter" />
              <p className="mt-4 text-lg font-semibold text-[var(--text)]">No rescues yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
                New donations will appear here soon—when a neighbor posts a food rescue, you&apos;ll see the pickup
                window and storage notes right on the card.
              </p>
            </li>
          )}
          {sorted.map((d, i) => {
            const urgent = isDonationUrgent(d);
            return (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                whileHover={{ y: -2 }}
                className="dispatch-card flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {urgent && <span className="badge-urgent">Urgent</span>}
                    <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--text)] ring-1 ring-[var(--border)]">
                      {d.status.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                      {STORAGE_LABELS[d.storageType]}
                    </span>
                  </div>
                  <p className="font-semibold text-[var(--text)]">{d.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {FOOD_CATEGORY_LABELS[d.foodCategory]} · {d.estimatedMeals} meals · {d.quantityDescription}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    <span className="font-medium text-[var(--text)]">Pickup window:</span>{" "}
                    {new Date(d.earliestPickup).toLocaleString()} – {new Date(d.latestPickup).toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    <span className="font-medium text-[var(--text)]">📍</span> {d.pickupAddress}
                  </p>
                  {d.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
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
                <div className="flex flex-wrap items-center gap-2">
                  {d.status === "open" && (
                    <button
                      type="button"
                      onClick={() => void claim(d.id)}
                      className="rounded-xl bg-[var(--highlight-soft)] px-4 py-2 text-sm font-semibold text-[var(--highlight-ink)] ring-1 ring-[var(--highlight)]/35 transition hover:bg-[var(--highlight-soft)]/80"
                    >
                      Claim this rescue
                    </button>
                  )}
                  {d.status === "matched" && d.shelterId === meId && !d.driverId && (
                    <button
                      type="button"
                      onClick={() => void unmatch(d.id)}
                      className="rounded-xl border border-[var(--danger)]/50 bg-[var(--danger)]/10 px-4 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/16"
                    >
                      Unmatch
                    </button>
                  )}
                  <Link href={`/donation/${d.id}`} className="btn-secondary px-4 py-2 text-sm">
                    View details
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
