import { NextResponse } from "next/server";
import { computeGlobalImpact } from "@/lib/impact";
import { ensureDemoSeed } from "@/lib/init";
import { readSession } from "@/lib/session-user";
import { getData, getUser, listDonations } from "@/lib/store";

export async function GET() {
  ensureDemoSeed();
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = getData();
  const stats = computeGlobalImpact(listDonations(), data.users);

  let personal: Record<string, number> | undefined;
  if (session.role === "donor") {
    const mine = listDonations().filter((d) => d.donorId === session.id && d.status === "completed");
    personal = {
      mealsYouRescued: mine.reduce((a, d) => a + d.estimatedMeals, 0),
      donationsYouCompleted: mine.length,
    };
  } else if (session.role === "driver") {
    const d = getUser(session.id);
    personal = {
      deliveriesYouCompleted: d?.role === "driver" ? d.deliveriesCompleted : 0,
      milesYouDrove: d?.role === "driver" ? d.milesDriven : 0,
    };
  } else if (session.role === "shelter") {
    const mine = listDonations().filter((d) => d.shelterId === session.id && d.status === "completed");
    personal = {
      mealsReceived: mine.reduce((a, d) => a + d.estimatedMeals, 0),
      pickupsCompleted: mine.length,
    };
  }

  return NextResponse.json({ global: stats, personal });
}
