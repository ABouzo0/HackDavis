import { NextResponse } from "next/server";
import { distanceMiles } from "@/lib/geo";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, getDonation, saveData, upsertDonation } from "@/lib/store";
import type { DriverProfile } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "driver") {
    return NextResponse.json({ error: "Drivers only" }, { status: 403 });
  }

  const { id } = await params;
  const donation = getDonation(id);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (donation.status !== "matched" || donation.driverId) {
    return NextResponse.json({ error: "Cannot accept this donation" }, { status: 400 });
  }
  const shelter = donation.shelterId ? getData().users[donation.shelterId] : undefined;
  if (!shelter || shelter.role !== "shelter") {
    return NextResponse.json({ error: "Donation has no shelter" }, { status: 400 });
  }

  const driver = session as DriverProfile;
  const distPickup = distanceMiles(driver.coordinates, donation.pickupCoordinates);
  const distDrop = distanceMiles(donation.pickupCoordinates, shelter.coordinates);
  if (distPickup > driver.maxDistanceMiles) {
    return NextResponse.json({ error: "Pickup is outside your travel radius" }, { status: 400 });
  }
  if (distDrop > 40) {
    return NextResponse.json({ error: "Delivery leg is unusually long" }, { status: 400 });
  }

  if (donation.storageType === "refrigerated" || donation.storageType === "frozen") {
    if (!driver.canRefrigerated) {
      return NextResponse.json({ error: "This donation requires refrigerated transport" }, { status: 400 });
    }
  }

  const miles = distPickup + distDrop;
  donation.driverId = driver.id;
  donation.status = "in_transit";
  donation.updatedAt = new Date().toISOString();
  upsertDonation(donation);

  driver.milesDriven += miles;
  driver.deliveriesCompleted += 1;
  const data = getData();
  data.users[driver.id] = driver;
  saveData(data);

  return NextResponse.json({ donation, routeMiles: Math.round(miles * 10) / 10 });
}
