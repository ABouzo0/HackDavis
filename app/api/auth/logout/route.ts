import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/session-user";
import { deleteSession } from "@/lib/store";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) deleteSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
