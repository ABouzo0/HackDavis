import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, getDonation, saveData, upsertDonation } from "@/lib/store";
import type { DonorProfile, ShelterProfile } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!donation.safetyChecklistPickup || !donation.safetyChecklistDropoff) {
    return NextResponse.json({ error: "Complete both safety checklists first" }, { status: 400 });
  }
  if (!donation.shelterReceiptConfirmedAt) {
    return NextResponse.json(
      { error: "The receiving shelter must confirm receipt before this rescue can be closed" },
      { status: 400 },
    );
  }
  if (donation.status !== "in_transit") {
    return NextResponse.json({ error: "Delivery must be in transit" }, { status: 400 });
  }

  if (session.role !== "driver" && session.role !== "shelter" && session.role !== "donor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  donation.status = "completed";
  donation.updatedAt = new Date().toISOString();
  upsertDonation(donation);

  const data = getData();
  const donor = data.users[donation.donorId];
  if (donor && donor.role === "donor") {
    const d = donor as DonorProfile;
    d.completedDonations += 1;
    d.reputationScore = Math.min(100, d.reputationScore + 1);
    data.users[d.id] = d;
  }

  if (donation.shelterId) {
    const sh = data.users[donation.shelterId];
    if (sh && sh.role === "shelter") {
      const s = sh as ShelterProfile;
      s.historicalMealsReceived += donation.estimatedMeals;
      data.users[s.id] = s;
    }
  }

  saveData(data);
  return NextResponse.json({ donation });
}
