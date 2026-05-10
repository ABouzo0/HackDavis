"use client";

const base = "h-11 w-11 shrink-0 text-[var(--accent)]";

/** Step 1: donor posts surplus — clipboard + sealed box */
export function IconDonorPost({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="6" width="22" height="30" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14h14M14 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="16" y="26" width="16" height="12" rx="2" fill="var(--highlight-soft)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 30h10M19 33h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

/** Step 2: shelter matches — building + check */
export function IconShelterMatch({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 8L10 18v20a3 3 0 003 3h22a3 3 0 003-3V18L24 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 28h12M18 32h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="32" cy="14" r="7" fill="var(--bg-elevated)" stroke="var(--highlight)" strokeWidth="1.8" />
      <path d="M29 14l2 2 4-4" stroke="var(--highlight)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Impact pillar icons — same stroke weight as step icons */
export function IconLessWaste({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse cx="24" cy="30" rx="16" ry="5" stroke="currentColor" strokeWidth="2" />
      <path d="M14 22h20l-2 8H16l-2-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 14h12l-1 8H19l-1-8z" fill="var(--highlight-soft)" stroke="var(--highlight)" strokeWidth="1.5" />
    </svg>
  );
}

export function IconFasterMatch({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M10 28c12-18 28-18 40 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path d="M26 12l-4 12h10l-4 12" stroke="var(--highlight)" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IconNeighbors({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="16" cy="18" r="6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="32" cy="18" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 34c4-8 24-8 28 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="26" width="8" height="10" rx="1" fill="var(--highlight-soft)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Step 3: driver completes pickup — vehicle + box */
export function IconDriverPickup({ className }: { className?: string }) {
  return (
    <svg className={className ?? base} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="20" width="30" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M36 24h6l2 6v4h-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="14" cy="38" r="3" fill="currentColor" opacity="0.35" />
      <circle cx="28" cy="38" r="3" fill="currentColor" opacity="0.35" />
      <rect x="10" y="12" width="12" height="10" rx="1.5" fill="var(--highlight-soft)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 16h6M13 19h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
