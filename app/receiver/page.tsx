import { redirect } from "next/navigation";

/** Create account as a shelter / pantry / nonprofit receiver. */
export default function ReceiverSignupEntryPage() {
  redirect("/register?role=receiver");
}
