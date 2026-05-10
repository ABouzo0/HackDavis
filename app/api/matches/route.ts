import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { rankSheltersForDonation } from "@/lib/matching";
import { readSession } from "@/lib/session-user";
import { getData, getDonation, getShelterNeedForShelter } from "@/lib/store";
import type { ShelterNeed, ShelterProfile } from "@/lib/types";

export async function GET(req: Request) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const donationId = url.searchParams.get("donationId");
  if (!donationId) {
    return NextResponse.json({ error: "donationId required" }, { status: 400 });
  }

  const donation = getDonation(donationId);
  if (!donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });

  if (session.role === "donor" && donation.donorId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = getData();
  const shelters = Object.values(data.users).filter((u): u is ShelterProfile => u.role === "shelter");
  const needsMap = new Map<string, ShelterNeed>();
  for (const s of shelters) {
    const n = getShelterNeedForShelter(s.id);
    if (n) needsMap.set(s.id, n);
  }

  const matches = rankSheltersForDonation(donation, shelters, needsMap);
  return NextResponse.json({ matches });
}
