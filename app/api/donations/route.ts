import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { listDonations, upsertDonation } from "@/lib/store";
import type { Donation } from "@/lib/types";
import { donationCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status");

  let items = listDonations();

  if (session.role === "donor") {
    items = items.filter((d) => d.donorId === session.id);
  } else if (session.role === "shelter") {
    items = items.filter(
      (d) => d.status === "open" || d.shelterId === session.id,
    );
  } else if (session.role === "driver") {
    items = items.filter((d) => {
      if (d.status === "open") return true;
      if (d.status === "matched" && !d.driverId) return true;
      if (d.driverId === session.id) return true;
      return false;
    });
  }

  if (statusFilter) {
    items = items.filter((d) => d.status === statusFilter);
  }

  items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return NextResponse.json({ donations: items });
}

export async function POST(req: Request) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "donor") {
    return NextResponse.json({ error: "Only donors can create donations" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = donationCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid donation", details: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;
  const now = new Date().toISOString();
  const d: Donation = {
    id: uuid(),
    donorId: session.id,
    title: b.title,
    foodCategory: b.foodCategory,
    quantityDescription: b.quantityDescription,
    estimatedMeals: b.estimatedMeals,
    pickupAddress: b.pickupAddress,
    pickupCoordinates: { lat: b.lat, lng: b.lng },
    earliestPickup: b.earliestPickup,
    latestPickup: b.latestPickup,
    expirationDeadline: b.expirationDeadline,
    storageType: b.storageType,
    dietaryTags: b.dietaryTags,
    allergenNotes: b.allergenNotes,
    packagingStatus: b.packagingStatus,
    photoUrl: b.photoUrl?.trim() ? b.photoUrl : undefined,
    instructions: b.instructions,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  upsertDonation(d);
  return NextResponse.json({ donation: d });
}
