"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DIETARY_TAGS,
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
  DIETARY_LABELS,
  STORAGE_TYPES,
  STORAGE_LABELS,
} from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/site-images";

const DAVIS = { lat: 38.5449, lng: -121.7405 };

export default function NewDonationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaults = useMemo(() => {
    const now = new Date();
    return {
      earliest: toLocalInput(now),
      latest: toLocalInput(new Date(now.getTime() + 45 * 60 * 1000)),
      exp: toLocalInput(new Date(now.getTime() + 3 * 3600 * 1000)),
    };
  }, []);

  const [title, setTitle] = useState("Surplus meals — pickup today");
  const [foodCategory, setFoodCategory] = useState<string>("prepared_meals");
  const [quantityDescription, setQuantityDescription] = useState("40 boxed meals");
  const [estimatedMeals, setEstimatedMeals] = useState(40);
  const [pickupAddress, setPickupAddress] = useState("1 Shields Ave, Davis, CA");
  const [earliestPickup, setEarliestPickup] = useState(defaults.earliest);
  const [latestPickup, setLatestPickup] = useState(defaults.latest);
  const [expirationDeadline, setExpirationDeadline] = useState(defaults.exp);
  const [storageType, setStorageType] = useState<string>("refrigerated");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [allergenNotes, setAllergenNotes] = useState("May contain wheat; nuts in some boxes.");
  const [packagingStatus, setPackagingStatus] = useState("Sealed commercial packaging");
  const [instructions, setInstructions] = useState("Use loading dock; ask for kitchen lead.");

  function toggleTag(tag: string) {
    setDietaryTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        foodCategory,
        quantityDescription,
        estimatedMeals,
        pickupAddress,
        lat: DAVIS.lat,
        lng: DAVIS.lng,
        earliestPickup: new Date(earliestPickup).toISOString(),
        latestPickup: new Date(latestPickup).toISOString(),
        expirationDeadline: new Date(expirationDeadline).toISOString(),
        storageType,
        dietaryTags,
        allergenNotes,
        packagingStatus,
        instructions,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Failed");
      return;
    }
    const j = (await res.json()) as { donation: { id: string } };
    router.push(`/donation/${j.donation.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/donor"
        className="inline-flex text-sm font-medium text-[var(--accent)] transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        ← Back to your kitchen
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-soft relative mt-5 overflow-hidden rounded-[1.75rem]"
      >
        <div className="relative h-28 sm:h-36">
          <Image
            src={SITE_IMAGES.postRescueBanner}
            alt="Close-up of a plated meal on a wooden table—representing food ready to be listed for rescue."
            fill
            className="object-cover object-center opacity-90"
            sizes="(max-width: 672px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
        </div>
        <div className="relative -mt-10 px-5 pb-6 pt-0 sm:-mt-12 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">New listing</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">Post a food rescue</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            Honest pickup windows, storage, and food safety notes help shelters find nearby donations fast—and keep
            everyone safe.
          </p>
        </div>
      </motion.div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="card-soft mt-8 space-y-8 p-6 shadow-lg shadow-black/10 md:p-8"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">The basics</h2>
            <p className="form-hint mt-1">What it is, how much, and where to meet.</p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Short title</span>
            <input
              className="input-field mt-1.5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: boxed sandwiches, pastries, rice trays"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Food type</span>
            <select
              className="select-field mt-1.5 w-full"
              value={foodCategory}
              onChange={(e) => setFoodCategory(e.target.value)}
            >
              {FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {FOOD_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">How you&apos;d describe the amount</span>
            <input
              className="input-field mt-1.5"
              value={quantityDescription}
              onChange={(e) => setQuantityDescription(e.target.value)}
              placeholder="Example: 12 meals or 3 trays"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Rough meal count</span>
            <input
              type="number"
              className="input-field mt-1.5"
              value={estimatedMeals}
              min={1}
              onChange={(e) => setEstimatedMeals(+e.target.value)}
              required
            />
            <p className="form-hint mt-1.5">A ballpark is fine; it powers matching and impact stats.</p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Pickup address</span>
            <input
              className="input-field mt-1.5"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Street, city, any dock or suite detail"
              required
            />
          </label>
        </section>

        <section className="space-y-4 border-t border-[var(--border)] pt-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Timing</h2>
            <p className="form-hint mt-1">Pickups and safe-to-eat deadlines—be conservative.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Earliest pickup</span>
              <input
                type="datetime-local"
                className="input-field mt-1.5"
                value={earliestPickup}
                onChange={(e) => setEarliestPickup(e.target.value)}
              />
              <p className="form-hint">Choose the earliest time this food can be picked up.</p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Latest pickup</span>
              <input
                type="datetime-local"
                className="input-field mt-1.5"
                value={latestPickup}
                onChange={(e) => setLatestPickup(e.target.value)}
              />
              <p className="form-hint">Last moment drivers can arrive before this food needs to move on.</p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Use-by / safe deadline</span>
              <input
                type="datetime-local"
                className="input-field mt-1.5"
                value={expirationDeadline}
                onChange={(e) => setExpirationDeadline(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 border-t border-[var(--border)] pt-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Food safety notes</h2>
            <p className="form-hint mt-1">Shelters scan this first—plain language wins.</p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">How it&apos;s kept cold or dry</span>
            <select
              className="select-field mt-1.5 w-full"
              value={storageType}
              onChange={(e) => setStorageType(e.target.value)}
            >
              {STORAGE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {STORAGE_LABELS[s]}
                </option>
              ))}
            </select>
            <p className="form-hint">
              Let shelters know if this needs refrigeration, freezing, or dry storage.
            </p>
          </label>
          <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-4">
            <legend className="px-1 text-sm font-medium text-[var(--text)]">Dietary tags</legend>
            <p className="form-hint mb-3">Tap all that apply—helps filters on the shelter side.</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    dietaryTags.includes(t)
                      ? "bg-[var(--accent)]/22 text-[var(--accent)] ring-1 ring-[var(--accent)]/35"
                      : "bg-[var(--surface-2)] text-[var(--muted)] ring-1 ring-transparent hover:ring-[var(--border)]"
                  }`}
                >
                  {DIETARY_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Allergen notes</span>
            <textarea
              className="input-field mt-1.5 min-h-[4.5rem]"
              rows={2}
              value={allergenNotes}
              onChange={(e) => setAllergenNotes(e.target.value)}
              placeholder="Wheat, dairy, shared fryer—whatever teams should know"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Packaging</span>
            <input
              className="input-field mt-1.5"
              value={packagingStatus}
              onChange={(e) => setPackagingStatus(e.target.value)}
              placeholder="Sealed, labeled commercial packs, etc."
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Pickup instructions</span>
            <textarea
              className="input-field mt-1.5 min-h-[4.5rem]"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Loading dock, who to call on-site, gate codes…"
            />
          </label>
        </section>

        {error && (
          <p className="rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ y: loading ? 0 : -2 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="btn-primary interactive-glow w-full py-3.5 text-base disabled:pointer-events-none"
        >
          {loading ? "Posting…" : "Post a food rescue"}
        </motion.button>
      </form>
    </div>
  );
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
