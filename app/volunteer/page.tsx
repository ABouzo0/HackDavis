import { redirect } from "next/navigation";

/**
 * Create account as a volunteer driver.
 * Note: `/driver` is the logged-in driver dashboard; this route is signup-only.
 */
export default function VolunteerDriverSignupEntryPage() {
  redirect("/register?role=volunteer");
}
