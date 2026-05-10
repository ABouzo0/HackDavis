"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = {
  id: string;
  name: string;
  role: "donor" | "shelter" | "driver" | "admin";
  email: string;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dim)] text-white shadow-md ring-2 ring-white ${className ?? ""}`}
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
        <path
          d="M12 3C8.5 3 6 6 6 9.5c0 4 3 8.5 6 11.5 3-3 6-7.5 6-11.5C18 6 15.5 3 12 3Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path d="M12 7c-1.2 0-2 1-2 2.2 0 1.8 1.2 3.8 2 5.1.8-1.3 2-3.3 2-5.1C14 8 13.2 7 12 7Z" fill="var(--highlight-alt)" />
      </svg>
    </span>
  );
}

function navItemClass(active: boolean) {
  return [
    "rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
    active
      ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/25"
      : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  ].join(" ");
}

export function Nav() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const loading = me === undefined;

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { user: Me | null }) => setMe(d.user));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setMe(null);
    window.location.href = "/";
  }

  const dash =
    me?.role === "donor"
      ? "/donor"
      : me?.role === "shelter"
        ? "/shelter"
        : me?.role === "driver"
          ? "/driver"
          : me?.role === "admin"
            ? "/admin"
            : null;

  const homeActive = pathname === "/";
  const dashActive =
    Boolean(dash) &&
    (pathname === dash ||
      (dash != null && pathname.startsWith(`${dash}/`)) ||
      Boolean(me && pathname.startsWith("/donation")));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--border)] bg-[var(--surface)]/95 shadow-[0_10px_36px_-14px_rgba(42,38,34,0.1)] backdrop-blur-xl backdrop-saturate-150">
      <div className="header-shimmer h-px w-full opacity-80" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <Link
            href="/"
            data-magnetic
            className="group inline-flex items-center gap-3 rounded-2xl py-1 pr-2 text-left transition"
            aria-current={homeActive ? "page" : undefined}
          >
            <LogoMark className="h-11 w-11" />
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dim)] bg-clip-text text-transparent">Replate</span>
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:block">
                Community rescue network
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-1.5 text-sm sm:gap-2" aria-label="Main">
          {loading ? (
            <span className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
              One moment…
            </span>
          ) : me ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Link href="/" data-magnetic className={navItemClass(pathname === "/")}>
                Home
              </Link>
              <span className="hidden max-w-[9rem] truncate px-1 text-xs text-[var(--muted)] sm:inline" title={me.name}>
                Hi, {me.name.split(" ")[0]}
              </span>
              {dash && (
                <Link href={dash} data-magnetic className={navItemClass(dashActive)}>
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                data-magnetic
                onClick={() => void logout()}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/" data-magnetic className={navItemClass(homeActive)}>
                Home
              </Link>
              <Link href="/login" data-magnetic className={navItemClass(pathname === "/login")}>
                Log in
              </Link>
              <Link
                href="/register"
                data-magnetic
                className="btn-primary interactive-glow inline-flex px-5 py-2.5 text-sm"
              >
                Join us
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
