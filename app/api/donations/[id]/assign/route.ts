import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, getDonation, saveData, upsertDonation } from "@/lib/store";
import type { ShelterProfile } from "@/lib/types";
import { z } from "zod";

/** Empty `{}` is valid — shelter id defaults to the signed-in user. */
const bodySchema = z.object({ shelterId: z.string().min(1).optional() });

type Params = { params: Promise<{ id: string }> };

/** Shelter claims an open donation (links this shelter as recipient). */
export async function POST(req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (donation.status !== "open") {
    return NextResponse.json({ error: "Donation is no longer available" }, { status: 400 });
  }

  if (session.role !== "shelter") {
    return NextResponse.json({ error: "Only shelters can claim donations" }, { status: 403 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const shelterId = parsed.data?.shelterId ?? session.id;
  if (shelterId !== session.id) {
    return NextResponse.json({ error: "You can only claim for your own organization" }, { status: 403 });
  }

  const user = getData().users[shelterId];
  if (!user || user.role !== "shelter") {
    return NextResponse.json({ error: "Invalid shelter" }, { status: 400 });
  }

  donation.shelterId = shelterId;
  donation.status = "matched";
  donation.updatedAt = new Date().toISOString();
  upsertDonation(donation);

  const shelter = user as ShelterProfile;
  shelter.historicalMealsRequested += donation.estimatedMeals;
  const data = getData();
  data.users[shelterId] = shelter;
  saveData(data);

  return NextResponse.json({ donation });
}
