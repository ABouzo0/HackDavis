import { cookies } from "next/headers";
import { getSessionUserId, getUser } from "./store";
import type { UserProfile } from "./types";

const COOKIE = "rr_session";

export async function readSession(): Promise<UserProfile | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const uid = getSessionUserId(token);
  if (!uid) return null;
  return getUser(uid) ?? null;
}

export { COOKIE };
