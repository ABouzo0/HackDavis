"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Login failed");
      return;
    }
    const j = (await res.json()) as { user: { role: string } };
    const r = j.user.role;
    router.push(r === "donor" ? "/donor" : r === "shelter" ? "/shelter" : r === "driver" ? "/driver" : "/");
    router.refresh();
  }

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Pick up where you left off—your rescues, claims, and routes are all on the same warm map."
      footerLink={{ href: "/register", label: "Create one", text: "New around here?" }}
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Email</span>
          <input
            className="input-field mt-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@organization.org"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--text)]">Password</span>
          <input
            className="input-field mt-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>
        {error && (
          <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary interactive-glow w-full py-3.5 text-base">
          {loading ? "Signing you in…" : "Log in"}
        </button>
      </form>
    </AuthSplitLayout>
  );
}
