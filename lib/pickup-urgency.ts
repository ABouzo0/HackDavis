/** Pure frontend heuristic for urgent pickups / expiring food (no API changes). */

export function isDonationUrgent(d: {
  status: string;
  latestPickup: string;
  expirationDeadline?: string;
}): boolean {
  if (d.status !== "open" && d.status !== "matched") return false;
  const now = Date.now();
  const latest = new Date(d.latestPickup).getTime();
  const hoursToPickup = (latest - now) / (3600 * 1000);
  if (hoursToPickup > 0 && hoursToPickup <= 6) return true;
  if (d.expirationDeadline) {
    const exp = new Date(d.expirationDeadline).getTime();
    const hoursToExp = (exp - now) / (3600 * 1000);
    if (hoursToExp > 0 && hoursToExp <= 8) return true;
  }
  return false;
}

export function sortDonationsUrgentFirst<
  T extends { status: string; latestPickup: string; expirationDeadline?: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ua = isDonationUrgent(a) ? 1 : 0;
    const ub = isDonationUrgent(b) ? 1 : 0;
    if (ua !== ub) return ub - ua;
    return +new Date(a.latestPickup) - +new Date(b.latestPickup);
  });
}
