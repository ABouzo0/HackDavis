import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, saveData, setShelterNeed } from "@/lib/store";
import type { ShelterNeed } from "@/lib/types";
import { shelterNeedSchema } from "@/lib/validators";

export async function GET() {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "shelter") {
    return NextResponse.json({ error: "Shelter only" }, { status: 403 });
  }
  const data = getData();
  const existing = Object.values(data.shelterNeeds).find((n) => n.shelterId === session.id);
  return NextResponse.json({ need: existing ?? null });
}

export async function POST(req: Request) {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "shelter") {
    return NextResponse.json({ error: "Shelter only" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = shelterNeedSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid need", details: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;
  const data = getData();
  const existing = Object.values(data.shelterNeeds).find((n) => n.shelterId === session.id);

  const need: ShelterNeed = {
    id: existing?.id ?? uuid(),
    shelterId: session.id,
    ...b,
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    data.shelterNeeds[need.id] = need;
    saveData(data);
  } else {
    setShelterNeed(need);
  }

  return NextResponse.json({ need });
}
