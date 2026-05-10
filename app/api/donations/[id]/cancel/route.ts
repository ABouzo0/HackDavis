import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, getDonation, saveData, upsertDonation } from "@/lib/store";
import type { DonorProfile } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "donor" && donation.donorId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (donation.status === "completed") {
    return NextResponse.json({ error: "Already completed" }, { status: 400 });
  }

  donation.status = "canceled";
  donation.updatedAt = new Date().toISOString();
  upsertDonation(donation);

  if (session.role === "donor" || donation.donorId === session.id) {
    const data = getData();
    const d = data.users[donation.donorId];
    if (d && d.role === "donor") {
      const donor = d as DonorProfile;
      donor.canceledDonations += 1;
      donor.reputationScore = Math.max(0, donor.reputationScore - 3);
      data.users[donor.id] = donor;
      saveData(data);
    }
  }

  return NextResponse.json({ donation });
}
