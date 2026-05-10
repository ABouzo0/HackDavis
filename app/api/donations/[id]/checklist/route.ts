import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getDonation, upsertDonation } from "@/lib/store";
import { safetyChecklistSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await req.json();
  const parsed = safetyChecklistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checklist", details: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;
  const ok =
    b.sealedPackaging &&
    b.withinPickupWindow &&
    b.allergensLabeled &&
    b.quantityMatches &&
    b.notSpoiled &&
    (b.refrigeratedOk !== false);

  if (!ok) {
    return NextResponse.json({ error: "All safety items must pass" }, { status: 400 });
  }

  const stamp = new Date().toISOString();
  const entry = {
    sealedPackaging: b.sealedPackaging,
    withinPickupWindow: b.withinPickupWindow,
    refrigeratedOk: b.refrigeratedOk,
    allergensLabeled: b.allergensLabeled,
    quantityMatches: b.quantityMatches,
    notSpoiled: b.notSpoiled,
    completedAt: stamp,
  };

  if (b.phase === "pickup") {
    if (session.role !== "donor" && session.role !== "driver") {
      return NextResponse.json({ error: "Only donor or driver at pickup" }, { status: 403 });
    }
    donation.safetyChecklistPickup = entry;
  } else {
    if (session.role !== "shelter" && session.role !== "driver") {
      return NextResponse.json({ error: "Only shelter or driver at dropoff" }, { status: 403 });
    }
    donation.safetyChecklistDropoff = entry;
  }

  donation.updatedAt = stamp;
  upsertDonation(donation);
  return NextResponse.json({ donation });
}
