import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { getData, getDonation, saveData, upsertDonation } from "@/lib/store";
import { readSession } from "@/lib/session-user";
import type { ShelterProfile } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

/** Shelter releases a matched donation back to open queue. */
export async function POST(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "shelter") {
    return NextResponse.json({ error: "Only shelters can unmatch donations" }, { status: 403 });
  }

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (donation.status !== "matched") {
    return NextResponse.json({ error: "Only matched donations can be released" }, { status: 400 });
  }
  if (donation.shelterId !== session.id) {
    return NextResponse.json({ error: "You can only unmatch your own claimed donations" }, { status: 403 });
  }
  if (donation.driverId) {
    return NextResponse.json({ error: "Cannot unmatch after a driver has accepted" }, { status: 400 });
  }

  donation.shelterId = undefined;
  donation.status = "open";
  donation.updatedAt = new Date().toISOString();
  upsertDonation(donation);

  const data = getData();
  const shelter = data.users[session.id];
  if (shelter && shelter.role === "shelter") {
    const typed = shelter as ShelterProfile;
    typed.historicalMealsRequested = Math.max(0, typed.historicalMealsRequested - donation.estimatedMeals);
    data.users[session.id] = typed;
    saveData(data);
  }

  return NextResponse.json({ donation });
}
