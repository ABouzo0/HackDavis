"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { FOOD_CATEGORY_LABELS, STORAGE_LABELS } from "@/lib/constants";
import { directionsUrl } from "@/lib/maps-link";
import { isDonationUrgent, sortDonationsUrgentFirst } from "@/lib/pickup-urgency";
import { EmptyRescueIllustration } from "@/components/EmptyRescueIllustration";
import { SITE_IMAGES } from "@/lib/site-images";
import type { FoodCategory, StorageType } from "@/lib/types";

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
  shelterId?: string;
};

type DonationDetail = {
  donation: Donation & { pickupCoordinates: { lat: number; lng: number } };
  related?: {
    shelter?: { name: string; coordinates: { lat: number; lng: number } };
  };
};

export default function DriverDashboard() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<{
    personal?: { milesYouDrove?: number; deliveriesYouCompleted?: number };
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/me", { credentials: "include" }).then((r) => r.json());
      if (!me.user || me.user.role !== "driver") {
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

  async function accept(id: string) {
    const res = await fetch(`/api/donations/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const dRes = await fetch("/api/donations", { credentials: "include" });
      if (dRes.ok) setDonations(((await dRes.json()) as { donations: Donation[] }).donations);
    }
  }

  const matched = useMemo(
    () => sortDonationsUrgentFirst(donations.filter((d) => d.status === "matched" && d.shelterId)),
    [donations],
  );
  const active = useMemo(() => donations.filter((d) => d.status === "in_transit"), [donations]);

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-soft relative overflow-hidden rounded-[1.75rem]"
      >
        <div className="relative h-36 md:h-44">
          <Image
            src={SITE_IMAGES.driverBanner}
            alt="View through a windshield driving on an open highway toward a delivery."
            fill
            className="object-cover object-center opacity-95"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--highlight)]/12 via-[var(--bg)]/92 to-[var(--bg)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        </div>
        <div className="relative -mt-12 px-6 pb-8 pt-0 md:-mt-14 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Dispatch · volunteer</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
            Volunteer to deliver
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            Grab a matched run when you have an hour—maps open from kitchen door to shelter desk with pickup window
            front and center.
          </p>
        </div>
      </motion.div>

      {impact?.personal && (
        <section className="px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Your impact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard label="Deliveries you finished" value={impact.personal.deliveriesYouCompleted ?? 0} delay={0} />
            <StatCard
              label="Miles logged with us"
              value={impact.personal.milesYouDrove?.toFixed(1) ?? "0"}
              delay={0.08}
            />
          </div>
        </section>
      )}

      <section className="px-1">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Needs a driver</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shelters already said yes—these rescues just need wheels. Urgent runs stay on top.
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {matched.length === 0 && (
            <li className="dispatch-card rounded-2xl px-6 py-12 text-center">
              <EmptyRescueIllustration variant="driver-queue" />
              <p className="mt-4 text-lg font-semibold text-[var(--text)]">No rescues yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
                New donations will appear here soon—when a shelter claims food and needs a lift, the dispatch card will
                land in this stack.
              </p>
            </li>
          )}
          {matched.map((d) => (
            <Row key={d.id} d={d} onAccept={() => void accept(d.id)} mode="accept" />
          ))}
        </ul>
      </section>

      <section className="px-1">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Your active run</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Open maps from here anytime—then mark checklists on the donation page.
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {active.length === 0 && (
            <li className="dispatch-card rounded-2xl px-6 py-12 text-center">
              <EmptyRescueIllustration variant="driver-run" />
              <p className="mt-4 text-lg font-semibold text-[var(--text)]">No active run</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
                Accept a pickup above and we&apos;ll pin the handoff, pickup window, and food safety checklist for you.
              </p>
            </li>
          )}
          {active.map((d) => (
            <Row key={d.id} d={d} mode="route" />
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({
  d,
  onAccept,
  mode,
}: {
  d: Donation;
  onAccept?: () => void;
  mode: "accept" | "route";
}) {
  const [detail, setDetail] = useState<DonationDetail | null>(null);
  const urgent = isDonationUrgent(d);

  useEffect(() => {
    if (mode !== "route") return;
    void fetch(`/api/donations/${d.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setDetail(j as DonationDetail));
  }, [d.id, mode]);

  const href =
    detail?.related?.shelter &&
    directionsUrl(detail.donation.pickupCoordinates, detail.related.shelter.coordinates);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="dispatch-card flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {urgent && <span className="badge-urgent">Urgent</span>}
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            {STORAGE_LABELS[d.storageType]}
          </span>
        </div>
        <p className="font-semibold text-[var(--text)]">{d.title}</p>
        <p className="text-sm text-[var(--muted)]">
          {FOOD_CATEGORY_LABELS[d.foodCategory]} · {d.estimatedMeals} meals
        </p>
        <p className="text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--text)]">Pickup window:</span>{" "}
          {new Date(d.earliestPickup).toLocaleString()} – {new Date(d.latestPickup).toLocaleString()}
        </p>
        <p className="text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--text)]">📍</span> {d.pickupAddress}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {mode === "accept" && (
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAccept}
            className="btn-primary interactive-glow px-4 py-2 text-sm"
          >
            Volunteer to deliver
          </motion.button>
        )}
        {mode === "route" && href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-4 py-2 text-sm font-semibold"
          >
            Open in Maps
          </a>
        )}
        <Link href={`/donation/${d.id}`} className="btn-secondary px-4 py-2 text-sm">
          Full page
        </Link>
      </div>
    </motion.li>
  );
}
