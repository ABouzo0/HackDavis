import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ensureDemoSeed } from "@/lib/init";
import { COOKIE } from "@/lib/session-user";
import { createSession, getData } from "@/lib/store";
import { publicUser } from "@/lib/public-user";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  ensureDemoSeed();
  const json = await req.json();
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const data = getData();
  const user = Object.values(data.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
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
