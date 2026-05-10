"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SITE_IMAGES } from "@/lib/site-images";

export function AuthSplitLayout({
  title,
  subtitle,
  footerLink,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  footerLink: { href: string; label: string; text: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_-20px_rgba(31,41,51,0.12)] backdrop-blur-sm lg:grid lg:grid-cols-[1fr_1fr]">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative hidden min-h-[440px] lg:block"
      >
        <Image
          src={SITE_IMAGES.authSide}
          alt="Warmly lit restaurant interior with tables set for guests."
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 0px, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--text)]/80 via-[var(--text)]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--surface)]/95" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Replate</p>
          <p className="mt-3 text-2xl font-bold leading-snug text-white drop-shadow-md">
            Every tray of surplus is a chance for someone to sleep with a full stomach tonight.
          </p>
        </div>
      </motion.div>

      <div className="max-h-[min(88vh,920px)] overflow-y-auto p-8 md:p-11 [scrollbar-width:thin]">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          <span aria-hidden>←</span> Back home
        </Link>
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">{title}</h1>
        {subtitle ? <div className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">{subtitle}</div> : null}
        <div className="mt-10">{children}</div>
        <p className="mt-10 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)]">
          {footerLink.text}{" "}
          <Link href={footerLink.href} className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            {footerLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
