"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FoodRescueMap, type MapMarkerPoint } from "@/components/maps/FoodRescueMap";
import {
  FOOD_CATEGORY_LABELS,
  STORAGE_LABELS,
} from "@/lib/constants";
import {
  allExternalDirectionLinks,
  openStreetMapBrowse,
  type LatLng,
} from "@/lib/map-links";
import { isDonationUrgent } from "@/lib/pickup-urgency";

type Donation = {
  id: string;
  donorId: string;
  title: string;
  status: string;
  foodCategory: string;
  estimatedMeals: number;
  pickupAddress: string;
  pickupCoordinates: { lat: number; lng: number };
  earliestPickup: string;
  latestPickup: string;
  expirationDeadline: string;
  storageType: string;
  dietaryTags: string[];
  allergenNotes: string;
  packagingStatus: string;
  instructions: string;
  shelterId?: string;
  driverId?: string;
  safetyChecklistPickup?: unknown;
  safetyChecklistDropoff?: unknown;
  shelterReceiptConfirmedAt?: string;
};

type Match = {
  shelterId: string;
  shelterName: string;
  score: number;
  distanceMiles: number;
  reasons: string[];
  needScore: number;
};

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [related, setRelated] = useState<
    | {
        shelter?: { name: string; coordinates: { lat: number; lng: number } };
      }
    | undefined
  >();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeLine, setRouteLine] = useState<[number, number][] | undefined>(undefined);

  async function refresh() {
    const [mRes, dRes] = await Promise.all([
      fetch("/api/me", { credentials: "include" }),
      fetch(`/api/donations/${id}`, { credentials: "include" }),
    ]);
    const mJson = (await mRes.json()) as { user: { id: string; role: string } | null };
    setMe(mJson.user);
    if (!dRes.ok) {
      setError("Could not load donation");
      return;
    }
    const dJson = (await dRes.json()) as {
      donation: Donation;
      related?: typeof related;
    };
    setDonation(dJson.donation);
    setRelated(dJson.related);

    if (dJson.donation.status === "open") {
      const mt = await fetch(`/api/matches?donationId=${id}`, { credentials: "include" });
      if (mt.ok) {
        const mj = (await mt.json()) as { matches: Match[] };
        setMatches(mj.matches);
      }
    } else {
      setMatches(null);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on id route change only
  }, [id]);

  const pickupCoord: LatLng | null = donation
    ? { lat: donation.pickupCoordinates.lat, lng: donation.pickupCoordinates.lng }
    : null;
  const dropCoord: LatLng | null =
    related?.shelter != null
      ? { lat: related.shelter.coordinates.lat, lng: related.shelter.coordinates.lng }
      : null;

  useEffect(() => {
    if (!pickupCoord || !dropCoord) {
      setRouteLine(undefined);
      return;
    }
    let cancelled = false;
    void fetch(
      `/api/map/route?fromLat=${pickupCoord.lat}&fromLng=${pickupCoord.lng}&toLat=${dropCoord.lat}&toLng=${dropCoord.lng}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { positions?: [number, number][] } | null) => {
        if (!cancelled && data?.positions?.length) setRouteLine(data.positions);
        else if (!cancelled) setRouteLine(undefined);
      })
      .catch(() => {
        if (!cancelled) setRouteLine(undefined);
      });
    return () => {
      cancelled = true;
    };
    // Primitives only — avoid re-fetch when parent re-renders recreate LatLng object identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickupCoord/dropCoord derived from donation
  }, [pickupCoord?.lat, pickupCoord?.lng, dropCoord?.lat, dropCoord?.lng]);

  const mapMarkers: MapMarkerPoint[] = useMemo(() => {
    if (!donation) return [];
    const items: MapMarkerPoint[] = [
      {
        id: "pickup",
        lat: donation.pickupCoordinates.lat,
        lng: donation.pickupCoordinates.lng,
        label: `Pickup · ${donation.pickupAddress}`,
        color: "#c4942e",
      },
    ];
    if (related?.shelter) {
      items.push({
        id: "dropoff",
        lat: related.shelter.coordinates.lat,
        lng: related.shelter.coordinates.lng,
        label: `Drop-off · ${related.shelter.name}`,
        color: "#5c3d9e",
      });
    }
    return items;
  }, [donation, related]);

  async function cancel() {
    await fetch(`/api/donations/${id}/cancel`, { method: "POST", credentials: "include" });
    await refresh();
  }

  async function unmatch() {
    const res = await fetch(`/api/donations/${id}/unassign`, { method: "POST", credentials: "include" });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Could not unmatch");
      return;
    }
    setError(null);
    await refresh();
    router.refresh();
  }

  async function submitChecklist(phase: "pickup" | "dropoff") {
    const body = {
      phase,
      sealedPackaging: true,
      withinPickupWindow: true,
      refrigeratedOk: true,
      allergensLabeled: true,
      quantityMatches: true,
      notSpoiled: true,
    };
    const res = await fetch(`/api/donations/${id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Checklist failed");
      return;
    }
    setError(null);
    await refresh();
  }

  async function confirmReceipt() {
    const res = await fetch(`/api/donations/${id}/confirm-receipt`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Could not confirm receipt");
      return;
    }
    setError(null);
    await refresh();
    router.refresh();
  }

  async function complete() {
    const res = await fetch(`/api/donations/${id}/complete`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Could not complete");
      return;
    }
    await refresh();
    router.refresh();
  }

  if (!donation || !me) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {error ? (
          <p className="rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <div className="card-soft space-y-4 rounded-2xl p-6 md:p-8">
            <div className="h-4 w-40 animate-pulse rounded-lg bg-[var(--surface-2)]" />
            <div className="h-9 w-3/4 max-w-md animate-pulse rounded-lg bg-[var(--surface-2)]" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded-lg bg-[var(--border)]" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-28 animate-pulse rounded-xl bg-[var(--surface-2)]" />
              <div className="h-28 animate-pulse rounded-xl bg-[var(--surface-2)]" />
            </div>
            <p className="text-sm text-[var(--muted)]">Pulling donation details…</p>
          </div>
        )}
      </div>
    );
  }

  const isDonor = me.role === "donor" && me.id === donation.donorId;

  const externalLinks =
    pickupCoord && dropCoord ? allExternalDirectionLinks(pickupCoord, dropCoord) : null;
  const osmPickupOnly =
    pickupCoord && !dropCoord ? openStreetMapBrowse(pickupCoord) : null;

  return (
    <div className="space-y-10">
      <div className="card-soft flex flex-wrap items-start justify-between gap-4 rounded-2xl p-5 md:p-6">
        <div>
          <Link
            href={me.role === "donor" ? "/donor" : me.role === "shelter" ? "/shelter" : "/driver"}
            className="text-sm font-medium text-[var(--accent)] transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            ← Back to dashboard
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">{donation.title}</h1>
            {isDonationUrgent(donation) && <span className="badge-urgent">Urgent</span>}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {FOOD_CATEGORY_LABELS[donation.foodCategory as keyof typeof FOOD_CATEGORY_LABELS]} ·{" "}
            {donation.estimatedMeals} meals ·{" "}
            <span className="font-medium capitalize text-[var(--accent)]">{donation.status.replace("_", " ")}</span>
            {" · "}
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
              {STORAGE_LABELS[donation.storageType as keyof typeof STORAGE_LABELS] ?? donation.storageType}
            </span>
          </p>
        </div>
        {isDonor && ["open", "matched", "in_transit"].includes(donation.status) && (
          <button
            type="button"
            onClick={() => void cancel()}
            className="rounded-xl border border-[var(--danger)]/50 bg-[var(--danger)]/10 px-4 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
          >
            Cancel this donation
          </button>
        )}
        {me.role === "shelter" &&
          me.id === donation.shelterId &&
          donation.status === "matched" &&
          !donation.driverId && (
            <button
              type="button"
              onClick={() => void unmatch()}
              className="rounded-xl border border-[var(--danger)]/50 bg-[var(--danger)]/10 px-4 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
            >
              Unmatch from this delivery
            </button>
          )}
      </div>

      {error && (
        <p className="rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="card-soft grid gap-6 rounded-2xl p-5 md:grid-cols-2 md:p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Pickup</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text)]">{donation.pickupAddress}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Latest pickup: {new Date(donation.latestPickup).toLocaleString()}
          </p>
          <p className="text-sm text-[var(--muted)]">
            Eat or freeze by: {new Date(donation.expirationDeadline).toLocaleString()}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">How it&apos;s stored</h2>
          <p className="mt-3 text-sm text-[var(--text)]">
            {STORAGE_LABELS[donation.storageType as keyof typeof STORAGE_LABELS] ?? donation.storageType}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{donation.packagingStatus}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <span className="font-medium text-[var(--text)]">Allergens:</span> {donation.allergenNotes}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text)]">{donation.instructions}</p>
        </div>
      </section>

      {donation.status === "open" && matches && matches.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)]">Shelters that fit this run</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sorted by distance, how hungry their last report looked, and how tight your pickup window is.
          </p>
          <ul className="mt-5 space-y-3">
            {matches.map((m) => (
              <li
                key={m.shelterId}
                className="card-soft rounded-2xl px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-[var(--text)]">{m.shelterName}</p>
                  <span className="rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    Match score {m.score}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  About {m.distanceMiles} mi · need signal {m.needScore}/100
                </p>
                <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-xs leading-relaxed text-[var(--muted)]">
                  {m.reasons.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="text-[var(--accent)]" aria-hidden>
                        ·
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card-soft rounded-2xl p-5 md:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">3D map &amp; directions</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Gold pin: pickup. Purple pin: drop-off once matched. Tilt and rotate the map with the compass control (3D
          terrain needs a free{" "}
          <span className="font-medium text-[var(--text)]">Mapbox token</span> in{" "}
          <code className="rounded bg-[var(--surface-2)] px-1 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code>
          ). Without it, you&apos;ll see a flat OpenStreetMap view. The route line is a rough preview—verify in your
          maps app before driving.
        </p>
        {related?.shelter && (
          <p className="mt-2 text-sm text-[var(--text)]">
            Recipient: <span className="text-[var(--muted)]">{related.shelter.name}</span>
          </p>
        )}
        <div className="mt-4">
          <FoodRescueMap markers={mapMarkers} routePositions={routeLine} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {externalLinks && (
            <>
              <a
                href={externalLinks.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="btn-primary interactive-glow px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Google Maps
              </a>
              <a
                href={externalLinks.appleMaps}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Apple Maps
              </a>
              <a
                href={externalLinks.openStreetMapBrowse}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                OpenStreetMap
              </a>
            </>
          )}
          {!externalLinks && osmPickupOnly && (
            <a
              href={osmPickupOnly}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              View pickup on OpenStreetMap
            </a>
          )}
        </div>
      </section>

      <section className="card-soft rounded-2xl p-5 md:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">Food safety checklists</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Quick confirmations at pickup and again at drop-off. In this demo, tapping below records a full pass—swap
          in per-item toggles when you wire a production flow.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {(me.role === "donor" || me.role === "driver") && donation.status !== "completed" && (
            <button
              type="button"
              onClick={() => void submitChecklist("pickup")}
              disabled={!!donation.safetyChecklistPickup}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {donation.safetyChecklistPickup ? "Pickup logged ✓" : "Log pickup checklist"}
            </button>
          )}
          {(me.role === "shelter" || me.role === "driver") && donation.status !== "completed" && (
            <button
              type="button"
              onClick={() => void submitChecklist("dropoff")}
              disabled={!!donation.safetyChecklistDropoff || !donation.safetyChecklistPickup}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {donation.safetyChecklistDropoff ? "Drop-off logged ✓" : "Log drop-off checklist"}
            </button>
          )}
        </div>
      </section>

      {donation.status === "in_transit" &&
        me.role === "shelter" &&
        me.id === donation.shelterId &&
        Boolean(donation.safetyChecklistDropoff) &&
        !donation.shelterReceiptConfirmedAt && (
          <section className="card-soft rounded-2xl border-2 border-[var(--highlight)]/40 bg-[var(--highlight-soft)]/30 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">Confirm you received the delivery</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              When the food is physically at your site and matches what was promised, confirm here. The driver or donor
              can only close this rescue after you confirm.
            </p>
            <button
              type="button"
              onClick={() => void confirmReceipt()}
              className="btn-primary interactive-glow mt-4 px-6 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              We received this delivery
            </button>
          </section>
        )}

      {donation.status === "in_transit" &&
        Boolean(donation.safetyChecklistPickup) &&
        Boolean(donation.safetyChecklistDropoff) &&
        Boolean(donation.shelterReceiptConfirmedAt) && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Recipient confirmed{" "}
              {donation.shelterReceiptConfirmedAt
                ? new Date(donation.shelterReceiptConfirmedAt).toLocaleString()
                : ""}
              . Anyone on the run can close it out.
            </p>
            <button
              type="button"
              onClick={() => void complete()}
              className="btn-primary interactive-glow px-6 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Mark delivery complete
            </button>
          </div>
        )}
    </div>
  );
}
