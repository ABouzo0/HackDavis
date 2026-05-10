import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getDonation, getUser } from "@/lib/store";
import type { ShelterProfile } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const d = getDonation(id);
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let related: { shelter?: { name: string; coordinates: { lat: number; lng: number } } } | undefined;
  if (d.shelterId) {
    const s = getUser(d.shelterId);
    if (s?.role === "shelter") {
      const sh = s as ShelterProfile;
      related = {
        shelter: { name: sh.organizationName ?? sh.name, coordinates: sh.coordinates },
      };
    }
  }

  return NextResponse.json({ donation: d, related });
}
