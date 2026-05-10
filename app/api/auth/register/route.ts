import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ensureDemoSeed } from "@/lib/init";
import { COOKIE } from "@/lib/session-user";
import { createSession, getData, upsertUser } from "@/lib/store";
import { publicUser } from "@/lib/public-user";
import type { AdminProfile, DonorProfile, DriverProfile, ShelterProfile, UserProfile } from "@/lib/types";
import { registerSchema, type RegisterInput } from "@/lib/validators";

export async function POST(req: Request) {
  ensureDemoSeed();
  const json = await req.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  const data = getData();
  if (Object.values(data.users).some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const id = uuid();
  const now = new Date().toISOString();
  const hash = await bcrypt.hash(body.password, 10);
  const base = {
    id,
    email: body.email.toLowerCase(),
    passwordHash: hash,
    name: body.name,
    phone: body.phone,
    locationLabel: body.locationLabel,
    coordinates: { lat: body.lat, lng: body.lng },
    organizationName: body.organizationName,
    createdAt: now,
    updatedAt: now,
  };

  let user: UserProfile;
  try {
    user = buildUser(base, body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid role payload";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  upsertUser(user);
  const token = createSession(user.id);
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 72 * 3600,
  });
  return res;
}

function buildUser(
  base: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    phone: string;
    locationLabel: string;
    coordinates: { lat: number; lng: number };
    organizationName?: string;
    createdAt: string;
    updatedAt: string;
  },
  body: RegisterInput,
): UserProfile {
  const role = body.role;
  if (role === "donor") {
    if (!body.donor) throw new Error("Donor fields required");
    const u: DonorProfile = {
      ...base,
      role: "donor",
      businessType: body.donor.businessType,
      typicalFoodCategories: body.donor.typicalFoodCategories,
      pickupInstructions: body.donor.pickupInstructions,
      reputationScore: 70,
      completedDonations: 0,
      canceledDonations: 0,
    };
    return u;
  }
  if (role === "shelter") {
    if (!body.shelter) throw new Error("Shelter fields required");
    const u: ShelterProfile = {
      ...base,
      role: "shelter",
      ...body.shelter,
    };
    return u;
  }
  if (role === "driver") {
    if (!body.driver) throw new Error("Driver fields required");
    const u: DriverProfile = {
      ...base,
      role: "driver",
      ...body.driver,
      milesDriven: 0,
      deliveriesCompleted: 0,
    };
    return u;
  }
  const u: AdminProfile = {
    ...base,
    role: "admin",
  };
  return u;
}
