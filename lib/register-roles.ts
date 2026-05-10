import type { UserRole } from "./types";

/** Maps friendly signup choices to API `role` values. */
export type SignupRoleId = Extract<UserRole, "donor" | "shelter" | "driver">;

/** Short URLs for “create account as…” — each redirects to `/register` with the right role. */
export const SIGNUP_PATH_BY_ROLE: Record<SignupRoleId, string> = {
  donor: "/provider",
  shelter: "/receiver",
  driver: "/volunteer",
};

/**
 * Parse `?role=` from the register page. Accepts API ids and friendly aliases
 * (`provider`, `receiver`, `volunteer`).
 */
export function signupRoleFromSearchParam(param: string | null): SignupRoleId | null {
  if (!param) return null;
  const p = param.toLowerCase().trim();
  if (p === "donor" || p === "provider" || p === "food-provider" || p === "food_provider") return "donor";
  if (p === "shelter" || p === "receiver") return "shelter";
  if (p === "driver" || p === "volunteer") return "driver";
  return null;
}

/** Friendly `?role=` values on `/register` (shareable links). */
export const REGISTER_URL_ROLE_PARAM: Record<SignupRoleId, string> = {
  donor: "provider",
  shelter: "receiver",
  driver: "volunteer",
};

export const SIGNUP_ROLE_OPTIONS: {
  id: SignupRoleId;
  title: string;
  shortTitle: string;
  description: string;
  examples: string;
  icon: string;
}[] = [
  {
    id: "donor",
    title: "Restaurant / Donor",
    shortTitle: "Provider",
    description: "Post a food rescue with pickup windows drivers can trust—cafés, groceries, dining halls, caterers.",
    examples: "Restaurant · bakery · dining hall · catered event",
    icon: "🍽️",
  },
  {
    id: "shelter",
    title: "Shelter / Receiver",
    shortTitle: "Receiver",
    description: "Find nearby donations that match storage, diet, and the folks you feed every day.",
    examples: "Shelter · food pantry · nonprofit · mutual aid hub",
    icon: "🏠",
  },
  {
    id: "driver",
    title: "Volunteer Driver",
    shortTitle: "Driver",
    description: "Volunteer to deliver with pickup window + map in hand—on your lunch break or Saturday morning.",
    examples: "Personal vehicle · student volunteer · nonprofit courier",
    icon: "🚐",
  },
];
