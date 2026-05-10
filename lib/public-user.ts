import type { UserProfile } from "./types";

export function publicUser(u: UserProfile) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}
