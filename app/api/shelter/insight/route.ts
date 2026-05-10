import { NextResponse } from "next/server";
import { computeShelterNeedScore, needScoreBand } from "@/lib/need-prediction";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData } from "@/lib/store";
import type { ShelterProfile } from "@/lib/types";

export async function GET() {
  ensureDemoSeed();
  const session = await readSession();
  if (!session || session.role !== "shelter") {
    return NextResponse.json({ error: "Shelter only" }, { status: 403 });
  }

  const shelter = session as ShelterProfile;
  const need = Object.values(getData().shelterNeeds).find((n) => n.shelterId === shelter.id);
  const score = computeShelterNeedScore(shelter, need);
  return NextResponse.json({
    needScore: score,
    band: needScoreBand(score),
  });
}
