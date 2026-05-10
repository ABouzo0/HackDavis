"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { HeroSDFMesh } from "@/components/creative/HeroSDFMesh";
import {
  IconDonorPost,
  IconDriverPickup,
  IconFasterMatch,
  IconLessWaste,
  IconNeighbors,
  IconShelterMatch,
} from "@/components/RescueStepIcons";
import { SITE_IMAGES } from "@/lib/site-images";
import { isDonationUrgent } from "@/lib/pickup-urgency";

const PLACEHOLDER_MEALS = 2840;
const PLACEHOLDER_LBS = 11820;
const PLACEHOLDER_URGENT = 18;

const stepIconClass = "h-9 w-9 shrink-0 text-[var(--accent)]";

const howSteps = [
  {
    n: "1",
    title: "Someone posts a rescue",
    body: "Restaurants list safe surplus with pickup windows and food safety notes—so neighbors know what’s real.",
    icon: "donor" as const,
  },
  {
    n: "2",
    title: "Shelters find a match",
    body: "Pantries see donations that fit storage, diet, and timing—then say yes before the window closes.",
    icon: "shelter" as const,
  },
  {
    n: "3",
    title: "Drivers run the route",
    body: "Volunteers pick up turn-by-turn details and move food while it’s still good to eat.",
    icon: "driver" as const,
  },
];

const impactPillarIconClass = "h-10 w-10 shrink-0 text-[var(--accent)]";

const impactPillars = [
  {
    title: "Less waste",
    body: "Keep edible food on plates instead of in the bin.",
    icon: "waste" as const,
  },
  {
    title: "Faster matching",
    body: "Urgent trays get to nearby shelters without the phone-tag.",
    icon: "speed" as const,
  },
  {
    title: "Neighbors helping neighbors",
    body: "Donors, shelters, and drivers share one simple rescue line.",
    icon: "community" as const,
  },
];

const heroThumbStrip: { src: string; alt: string }[] = [
  {
    src: SITE_IMAGES.thumbPacking,
    alt: "Stacks of labeled food boxes ready for charity pickup.",
  },
  {
    src: SITE_IMAGES.thumbRoute,
    alt: "White delivery van parked for a neighborhood drop-off.",
  },
  {
    src: SITE_IMAGES.thumbShelter,
    alt: "Hands ladling a hot meal into a bowl at a community serving line.",
  },
];

function HowStepIcon({ kind }: { kind: "donor" | "shelter" | "driver" }) {
  if (kind === "donor") return <IconDonorPost className={stepIconClass} />;
  if (kind === "shelter") return <IconShelterMatch className={stepIconClass} />;
  return <IconDriverPickup className={stepIconClass} />;
}

function ImpactPillarIcon({ kind }: { kind: "waste" | "speed" | "community" }) {
  if (kind === "waste") return <IconLessWaste className={impactPillarIconClass} />;
  if (kind === "speed") return <IconFasterMatch className={impactPillarIconClass} />;
  return <IconNeighbors className={impactPillarIconClass} />;
}

type ImpactGlobal = {
  mealsRescued: number;
  poundsFoodSaved: number;
  sheltersServed: number;
};

type DonationRow = {
  status: string;
  latestPickup: string;
  expirationDeadline?: string;
};

function FloatingRoleCard({ label, sub, className }: { label: string; sub: string; className: string }) {
  return (
    <div
      data-magnetic
      className={`rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-md backdrop-blur-sm ${className}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{label}</p>
      <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">{sub}</p>
    </div>
  );
}

export function HomeExperience() {
  const reduceMotion = useReducedMotion();
  const [stats, setStats] = useState<{
    meals: number;
    pounds: number;
    urgent: number;
    fromApi: boolean;
  }>({
    meals: PLACEHOLDER_MEALS,
    pounds: PLACEHOLDER_LBS,
    urgent: PLACEHOLDER_URGENT,
    fromApi: false,
  });

  useEffect(() => {
    void (async () => {
      const meRes = await fetch("/api/me", { credentials: "include" });
      const meJson = (await meRes.json()) as { user: { id: string } | null };
      if (!meJson.user) return;

      const [impactRes, donRes] = await Promise.all([
        fetch("/api/impact", { credentials: "include" }),
        fetch("/api/donations", { credentials: "include" }),
      ]);

      let meals = PLACEHOLDER_MEALS;
      let pounds = PLACEHOLDER_LBS;
      let urgent = 0;
      let usedImpact = false;

      if (impactRes.ok) {
        const j = (await impactRes.json()) as { global: ImpactGlobal };
        meals = j.global.mealsRescued;
        pounds = j.global.poundsFoodSaved;
        usedImpact = true;
      }

      if (donRes.ok) {
        const dj = (await donRes.json()) as { donations: DonationRow[] };
        urgent = dj.donations.filter((d) => isDonationUrgent(d)).length;
      }

      setStats({
        meals: usedImpact ? meals : PLACEHOLDER_MEALS,
        pounds: usedImpact ? pounds : PLACEHOLDER_LBS,
        urgent,
        fromApi: true,
      });
    })();
  }, []);

  return (
    <div className="relative space-y-16 pb-10 md:space-y-24 md:pb-14">
      {/* Hero — SDF mesh + map grid + route network */}
      <section className="relative min-h-[min(72vh,560px)] overflow-hidden rounded-[2rem] border-2 border-[var(--border)] bg-[var(--bg)] shadow-[0_24px_60px_-28px_rgba(42,38,34,0.12)]">
        <HeroSDFMesh staticFrame={Boolean(reduceMotion)} className="absolute inset-0 z-0 h-full w-full" />
        <div className="hero-map-grid absolute inset-0 z-[1] opacity-[0.22]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[var(--bg-elevated)]/72 via-transparent to-[var(--surface-2)]/40" />

        {/* Curved route lines (desktop) */}
        <svg
          className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full text-[var(--accent)] opacity-[0.35] lg:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            className={reduceMotion ? "" : "route-path-animated"}
            d="M 18 72 Q 38 38 50 48 Q 62 58 82 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            vectorEffect="nonScalingStroke"
          />
          <path
            className={reduceMotion ? "" : "route-path-delayed"}
            d="M 18 75 L 50 52 L 82 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.35"
            strokeDasharray="4 5"
            opacity="0.6"
            vectorEffect="nonScalingStroke"
          />
        </svg>

        <div className="relative z-10 grid gap-12 px-5 py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14 md:px-10 md:py-16 lg:px-12">
          <div>
            <div
              data-magnetic
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)]/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]"
            >
              Community rescue network · live logistics
            </div>
            <h1 className="kinetic-headline kinetic-headline--hero kinetic-headline--view max-w-xl font-bold text-[var(--text)]">
              Surplus food, routed home—before the clock wins.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
              A warm kitchen meets a real-time map: restaurants post rescues, shelters find nearby donations, and
              volunteers deliver while it’s still safe to eat.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/register"
                className="btn-primary interactive-glow inline-flex justify-center px-8 py-3.5 text-center text-base"
              >
                Join the rescue network
              </Link>
              <Link
                href="#how-rescue-works"
                className="btn-secondary inline-flex justify-center px-8 py-3.5 text-center text-base"
              >
                How the rescue works
              </Link>
            </div>
            <p
              data-magnetic
              className="mt-8 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 text-sm leading-relaxed text-[var(--muted)] shadow-sm"
            >
              <span className="font-semibold text-[var(--text)]">Demo night?</span> Password{" "}
              <code className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--accent)]">demo1234</code> — try{" "}
              <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">donor@rescueroute.demo</code>,{" "}
              <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">shelter@rescueroute.demo</code>, or{" "}
              <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">driver@rescueroute.demo</code>.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div
                data-magnetic
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-2xl font-bold tabular-nums text-[var(--accent)]">{stats.meals.toLocaleString()}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Meals rescued</p>
              </div>
              <div
                data-magnetic
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-2xl font-bold tabular-nums text-[var(--accent)]">{stats.pounds.toLocaleString()}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Pounds of food saved</p>
              </div>
              <div
                data-magnetic
                className="rounded-2xl border border-[var(--highlight)]/35 bg-[var(--highlight-soft)] px-4 py-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-2xl font-bold tabular-nums text-[var(--highlight-ink)]">{stats.urgent.toLocaleString()}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Urgent pickups completed</p>
              </div>
            </div>
            {stats.fromApi && (
              <p className="mt-3 text-center text-[11px] text-[var(--muted)] sm:text-left">
                Live totals while you&apos;re signed in; urgent count uses pickups closing soon on your board.
              </p>
            )}
          </div>

          {/* Network panel — floating roles + photo strip */}
          <div className="relative flex flex-col gap-6">
            <div className="relative min-h-[200px] lg:min-h-[300px]">
              <FloatingRoleCard
                label="Restaurant"
                sub="Post a food rescue with pickup window & notes."
                className="relative z-[2] w-full max-w-[220px] sm:max-w-[240px] lg:absolute lg:left-0 lg:top-[6%]"
              />
              <FloatingRoleCard
                label="Driver"
                sub="Volunteer to deliver — map-first handoffs."
                className="relative z-[2] mt-3 w-full max-w-[220px] sm:max-w-[240px] lg:absolute lg:left-[28%] lg:top-[42%] lg:mt-0"
              />
              <FloatingRoleCard
                label="Shelter"
                sub="Find nearby donations that fit your kitchen."
                className="relative z-[2] mt-3 w-full max-w-[220px] sm:max-w-[240px] lg:absolute lg:right-0 lg:top-[4%] lg:mt-0"
              />
            </div>
            <div
              data-magnetic
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-[var(--border)] shadow-lg"
            >
              <Image
                src={SITE_IMAGES.heroJourney}
                alt="Volunteers sorting donated food and supplies at a busy community distribution table."
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--text)]/70 via-[var(--text)]/10 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-medium leading-snug text-[var(--bg-elevated)]">
                “We posted at closing—minutes later a shelter and a driver had it moving.”
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {heroThumbStrip.map((item) => (
                <div
                  key={item.src}
                  data-magnetic
                  className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] shadow-sm"
                >
                  <Image src={item.src} alt={item.alt} fill className="object-cover object-center" sizes="120px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline — how the rescue works */}
      <section id="how-rescue-works" className="scroll-mt-28 px-1">
        <div className="scroll-depth-far">
          <h2 className="kinetic-headline kinetic-headline--view text-center text-2xl font-bold text-[var(--text)] md:text-3xl">
            How the rescue works
          </h2>
        </div>
        <div className="scroll-depth-mid">
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted)]">
            Follow the route from a busy kitchen to a full table—three stops, one network.
          </p>
        </div>

        <div className="scroll-depth-near relative mx-auto mt-12 max-w-2xl">
          <div className="absolute left-[1.125rem] top-3 bottom-3 w-0.5 rounded-full bg-[var(--border)]" aria-hidden />
          <ol className="relative space-y-10 pl-12 sm:pl-14">
            {howSteps.map((s) => (
              <li key={s.n} className="relative">
                <span
                  className="absolute left-[-2.75rem] top-0.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--surface)] shadow-sm ring-4 ring-[var(--bg)]"
                  aria-label={`Step ${s.n} of 3`}
                >
                  <HowStepIcon kind={s.icon} />
                </span>
                <div data-magnetic className="dispatch-card p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Step {s.n}</p>
                  <h3 className="kinetic-headline mt-1 text-lg font-semibold text-[var(--text)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impact — 30% lilac band */}
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-[var(--border)] bg-[var(--surface-2)] px-5 py-12 md:px-10 md:py-14">
        <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[var(--highlight-alt)]/20 blur-3xl" />
        <div className="scroll-depth-far relative">
          <h2 className="kinetic-headline kinetic-headline--view text-center text-2xl font-bold text-[var(--text)] md:text-3xl">
            Why this network matters
          </h2>
        </div>
        <div className="scroll-depth-mid relative">
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted)]">
            Same tools as a busy kitchen—just kinder timing and clearer handoffs.
          </p>
        </div>
        <div className="scroll-depth-near relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-[var(--border)] shadow-md">
          <div className="relative aspect-[800/360] max-h-56 w-full md:max-h-64">
            <Image
              src={SITE_IMAGES.shelterBanner}
              alt="Overhead view of a table set with many bowls and plates of fresh, colorful food ready to share."
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        </div>
        <div className="relative mt-10 grid gap-5 md:grid-cols-3">
          {impactPillars.map((item) => (
            <div
              key={item.title}
              data-magnetic
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/95 p-6 shadow-md transition-[border-color,box-shadow] hover:border-[var(--accent)]/35 hover:shadow-lg"
            >
              <ImpactPillarIcon kind={item.icon} />
              <h3 className="kinetic-headline mt-3 text-lg font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-center shadow-sm md:px-10">
        <h2 className="kinetic-headline kinetic-headline--view text-xl font-bold text-[var(--text)] md:text-2xl">
          Pick your lane
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--muted)]">
          Post a food rescue, find nearby donations, join as a shelter, or volunteer to deliver—same rails behind the
          scenes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            data-magnetic
            href="/provider"
            className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/45 hover:bg-[var(--surface-2)]"
          >
            Post a food rescue →
          </Link>
          <Link
            data-magnetic
            href="/receiver"
            className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/45 hover:bg-[var(--surface-2)]"
          >
            Join as a shelter →
          </Link>
          <Link
            data-magnetic
            href="/volunteer"
            className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/45 hover:bg-[var(--surface-2)]"
          >
            Volunteer to deliver →
          </Link>
          <Link
            data-magnetic
            href="/register"
            className="inline-flex rounded-full border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
          >
            Find nearby donations (sign up)
          </Link>
        </div>
      </section>
    </div>
  );
}
