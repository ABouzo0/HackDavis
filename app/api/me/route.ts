import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { publicUser } from "@/lib/public-user";

export async function GET() {
  ensureDemoSeed();
  const u = await readSession();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(u) });
}
