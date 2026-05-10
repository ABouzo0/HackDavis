import { redirect } from "next/navigation";

/** Create account as a food provider (restaurant, Panera-style closeout, etc.). */
export default function ProviderSignupEntryPage() {
  redirect("/register?role=provider");
}
