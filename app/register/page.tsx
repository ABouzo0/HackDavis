"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import {
  DIETARY_TAGS,
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
  DIETARY_LABELS,
} from "@/lib/constants";
import {
  REGISTER_URL_ROLE_PARAM,
  SIGNUP_PATH_BY_ROLE,
  SIGNUP_ROLE_OPTIONS,
  signupRoleFromSearchParam,
  type SignupRoleId,
} from "@/lib/register-roles";
import type { DietaryTag } from "@/lib/types";

const DAVIS = { lat: 38.5449, lng: -121.7405 };

function RegisterFallback() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] px-8 text-center text-[var(--muted)] shadow-sm">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
      </span>
      <p className="text-sm font-medium text-[var(--text)]">Getting your signup form ready…</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<SignupRoleId>(
    () => signupRoleFromSearchParam(searchParams.get("role")) ?? "donor",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [locationLabel, setLocationLabel] = useState("Davis, CA");

  const [businessType, setBusinessType] = useState("Quick-service restaurant / café");
  const [pickupInstructions, setPickupInstructions] = useState(
    "After closing: use loading dock, staff will meet drivers until 10pm.",
  );

  const [storageCapacity, setStorageCapacity] = useState(150);
  const [dailyDemand, setDailyDemand] = useState(80);
  const [operatingHours, setOperatingHours] = useState("8am–8pm");
  const [peopleServed, setPeopleServed] = useState(50);

  const [vehicleType, setVehicleType] = useState("Car");
  const [maxDistance, setMaxDistance] = useState(12);
  const [availability, setAvailability] = useState("Evenings");
  const [canCold, setCanCold] = useState(true);

  useEffect(() => {
    const fromUrl = signupRoleFromSearchParam(searchParams.get("role"));
    if (fromUrl) setRole(fromUrl);
  }, [searchParams]);

  function selectRole(next: SignupRoleId) {
    setRole(next);
    router.replace(`/register?role=${REGISTER_URL_ROLE_PARAM[next]}`, { scroll: false });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const base = {
      email,
      password,
      name,
      phone,
      organizationName: organizationName || undefined,
      locationLabel,
      lat: DAVIS.lat,
      lng: DAVIS.lng,
      role,
    };

    let body: Record<string, unknown> = { ...base };

    if (role === "donor") {
      body = {
        ...body,
        donor: {
          businessType,
          typicalFoodCategories: ["prepared_meals", "produce"] as const,
          pickupInstructions: pickupInstructions || "Call on arrival.",
        },
      };
    } else if (role === "shelter") {
      body = {
        ...body,
        shelter: {
          storageCapacityMeals: storageCapacity,
          dietaryRestrictions: [] as DietaryTag[],
          dailyMealDemand: dailyDemand,
          acceptedFoodCategories: ["prepared_meals", "produce", "packaged_goods", "mixed"] as const,
          operatingHours,
          peopleServedEstimate: peopleServed,
          historicalMealsRequested: 400,
          historicalMealsReceived: 350,
        },
      };
    } else {
      body = {
        ...body,
        driver: {
          vehicleType,
          maxDistanceMiles: maxDistance,
          availabilityNotes: availability,
          canRefrigerated: canCold,
        },
      };
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Could not register");
      return;
    }
    router.push(role === "donor" ? "/donor" : role === "shelter" ? "/shelter" : "/driver");
    router.refresh();
  }

  return (
    <AuthSplitLayout
      title="Join the rescue network"
      subtitle={
        <>
          Tell us who you are—<strong className="text-[var(--text)]">restaurant / donor</strong>,{" "}
          <strong className="text-[var(--text)]">shelter / receiver</strong>, or{" "}
          <strong className="text-[var(--text)]">volunteer driver</strong>. We&apos;ll only ask for details that help
          your part of the rescue go smoothly.
        </>
      }
      footerLink={{ href: "/login", label: "Log in instead", text: "Already have an account?" }}
    >
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--text)]">I am joining as</legend>
        <div className="grid gap-3 sm:grid-cols-1" role="radiogroup" aria-label="Account type">
          {SIGNUP_ROLE_OPTIONS.map((opt) => {
            const selected = role === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                layout
                role="radio"
                aria-checked={selected}
                onClick={() => selectRole(opt.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full rounded-2xl border p-5 text-left shadow-sm transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/35 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-2xl ring-1 ring-[var(--border)]" aria-hidden>
                    {opt.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-semibold ${selected ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
                        {opt.title}
                      </p>
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        }`}
                        aria-hidden
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-[var(--muted)]">{opt.description}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">{opt.examples}</p>
                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      Short link:{" "}
                      <code className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--accent)]">
                        {SIGNUP_PATH_BY_ROLE[opt.id]}
                      </code>
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </fieldset>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">About you</p>
          <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Your name</span>
          <input
            className="input-field mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Alex Rivera"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Email</span>
          <input
            className="input-field mt-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@kitchen.org"
          />
          <p className="form-hint">We’ll use this for sign-in and important updates about your runs.</p>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Password</span>
          <input
            className="input-field mt-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            placeholder="At least 6 characters"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Phone</span>
          <input
            className="input-field mt-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="(530) 555-0100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">
            {role === "donor"
              ? "Where pickups usually happen"
              : role === "shelter"
                ? "Your facility’s address or area"
                : "Where you’re usually based"}
          </span>
          <input
            className="input-field mt-2"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            required
            placeholder="Neighborhood, city, or street — we’ll match nearby runs"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">
            {role === "donor"
              ? "Business or kitchen name (optional)"
              : role === "shelter"
                ? "Organization name"
                : "Team or org (optional)"}
          </span>
          <input
            className="input-field mt-2"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder={
              role === "donor"
                ? "e.g. Sunrise Bakery — leave blank if it’s just you"
                : role === "shelter"
                  ? "e.g. River Community Food Pantry"
                  : "e.g. Davis Mutual Aid Drivers"
            }
          />
        </label>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--warm)]/90">
            A few more details
          </p>
          <div className="mt-4 space-y-4">
        {role === "donor" && (
          <>
            <p className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-3 py-2 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--accent)]">Providers</span> post surplus with pickup
              windows—perfect for end-of-day bread, catering leftovers, or deli closeout. Drivers and shelters
              see your listings in real time.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">What kind of kitchen are you?</span>
              <input
                className="input-field mt-2"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Café chain, grocery deli, dining hall, bakery…"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Default pickup tips for drivers</span>
              <textarea
                className="input-field mt-2"
                rows={3}
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                placeholder="e.g. After 9pm use back dock; call manager on posted number; refrigerated cases by kitchen."
              />
            </label>
            <p className="text-xs text-[var(--muted)]">
              Default food categories on your profile: {FOOD_CATEGORY_LABELS.prepared_meals},{" "}
              {FOOD_CATEGORY_LABELS.produce} (you can choose more per donation when posting).
            </p>
          </>
        )}

        {role === "shelter" && (
          <>
            <p className="rounded-xl border border-[var(--border)] bg-[var(--highlight-soft)] px-3 py-2 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--warn)]">Shelters / receivers</span> set capacity and need
              levels, then claim donations that fit—pantries and mutual aid hubs use this path too.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">How many meals can you store at once?</span>
              <input
                type="number"
                className="input-field mt-2"
                value={storageCapacity}
                onChange={(e) => setStorageCapacity(+e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Rough meals you aim to serve per day</span>
              <input
                type="number"
                className="input-field mt-2"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(+e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">When you’re typically open</span>
              <input
                className="input-field mt-2"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">People you serve (ballpark)</span>
              <input
                type="number"
                className="input-field mt-2"
                value={peopleServed}
                onChange={(e) => setPeopleServed(+e.target.value)}
              />
            </label>
            <p className="text-xs text-[var(--muted)]">
              Accepts: {FOOD_CATEGORIES.filter((c) => c !== "beverages").map((c) => FOOD_CATEGORY_LABELS[c]).join(", ")}
            </p>
          </>
        )}

        {role === "driver" && (
          <>
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--warn)]">Drivers</span> see matched runs from providers
              to receivers and can accept trips that fit their vehicle and radius.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">What you drive</span>
              <input
                className="input-field mt-2"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Comfortable radius (miles)</span>
              <input
                type="number"
                className="input-field mt-2"
                value={maxDistance}
                onChange={(e) => setMaxDistance(+e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">When you’re usually free to drive</span>
              <input
                className="input-field mt-2"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-snug text-[var(--text)] shadow-sm">
              <input
                type="checkbox"
                checked={canCold}
                onChange={(e) => setCanCold(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--accent)]"
              />
              <span>
                <span className="font-medium">I can move refrigerated or frozen food safely</span>
                <span className="mt-1 block text-[var(--muted)]">Uncheck if you only have room for shelf-stable bags.</span>
              </span>
            </label>
          </>
        )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary interactive-glow w-full py-3.5 text-base">
          {loading ? "Saving…" : "Save and continue"}
        </button>
      </form>
      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        Diet tags and food categories follow our shared glossary—examples include{" "}
        {DIETARY_TAGS.slice(0, 3).map((t) => DIETARY_LABELS[t]).join(", ")}…
      </p>
    </AuthSplitLayout>
  );
}
