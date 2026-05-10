import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getDonation, upsertDonation } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

/** Receiving shelter confirms the delivery physically arrived at their site. */
export async function POST(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "shelter") {
    return NextResponse.json({ error: "Only the receiving shelter can confirm receipt" }, { status: 403 });
  }

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (donation.shelterId !== session.id) {
    return NextResponse.json({ error: "You are not the recipient for this donation" }, { status: 403 });
  }
  if (donation.status !== "in_transit") {
    return NextResponse.json({ error: "Delivery must be in transit to confirm receipt" }, { status: 400 });
  }
  if (!donation.safetyChecklistDropoff) {
    return NextResponse.json({ error: "Complete the drop-off safety checklist first" }, { status: 400 });
  }

  donation.shelterReceiptConfirmedAt = new Date().toISOString();
  donation.updatedAt = donation.shelterReceiptConfirmedAt;
  upsertDonation(donation);
  return NextResponse.json({ donation });
}
