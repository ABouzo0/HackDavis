import { distanceMiles } from "./geo";
import { computeShelterNeedScore, needScoreBand } from "./need-prediction";
import type { Donation, MatchRecommendation, ShelterNeed, ShelterProfile } from "./types";

function storageCompatible(donationStorage: string, shelterCanStore: number): boolean {
  return shelterCanStore > 0;
}

function dietaryOverlap(
  donationTags: string[],
  shelterRestrictions: string[],
): { ok: boolean; penalty: number } {
  if (!shelterRestrictions.length) return { ok: true, penalty: 0 };
  const donationSet = new Set(donationTags);
  let conflicts = 0;
  for (const r of shelterRestrictions) {
    if (r === "nut_free" && donationSet.has("contains_common_allergens")) conflicts++;
    if (r === "vegetarian" && !donationTags.some((t) => t === "vegetarian" || t === "vegan"))
      conflicts++;
    if (r === "vegan" && !donationTags.includes("vegan")) conflicts++;
  }
  if (conflicts > 0) return { ok: false, penalty: 50 };
  return { ok: true, penalty: 0 };
}

function hoursUntil(iso: string, now: Date) {
  return (new Date(iso).getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function rankSheltersForDonation(
  donation: Donation,
  shelters: ShelterProfile[],
  needsByShelter: Map<string, ShelterNeed>,
  now: Date = new Date(),
): MatchRecommendation[] {
  const results: MatchRecommendation[] = [];

  for (const shelter of shelters) {
    const need = needsByShelter.get(shelter.id);
    const dist = distanceMiles(donation.pickupCoordinates, shelter.coordinates);
    if (dist > 80) continue;

    const needScore = computeShelterNeedScore(shelter, need, now);
    const diet = dietaryOverlap(
      donation.dietaryTags,
      [...shelter.dietaryRestrictions, ...(need?.dietaryRestrictions ?? [])],
    );

    const accepted = new Set([
      ...shelter.acceptedFoodCategories,
      ...(need?.acceptedFoodCategories ?? []),
    ]);
    const categoryMatch =
      accepted.size === 0 || accepted.has(donation.foodCategory) || accepted.has("mixed");

    if (!categoryMatch) continue;
    if (!diet.ok) continue;

    const urgencyH = Math.max(0, hoursUntil(donation.latestPickup, now));
    const expH = Math.max(0, hoursUntil(donation.expirationDeadline, now));
    const urgency =
      Math.min(40, (1 / Math.max(0.25, urgencyH)) * 8 + (1 / Math.max(0.25, expH)) * 10);

    const distanceScore = Math.max(0, 50 - dist * 1.2);
    const needBandBonus =
      needScoreBand(needScore) === "urgent"
        ? 20
        : needScoreBand(needScore) === "high"
          ? 12
          : 0;

    const storageOk = storageCompatible(
      donation.storageType,
      need?.storageCapacityAvailable ?? shelter.storageCapacityMeals,
    );
    if (!storageOk) continue;

    let score =
      distanceScore * 0.45 + needScore * 0.35 + urgency * 0.25 + needBandBonus;

    score -= diet.penalty * 0.1;
    score = Math.max(0, Math.min(100, score));

    const reasons: string[] = [];
    reasons.push(`~${dist.toFixed(1)} mi from pickup`);
    reasons.push(`Shelter need ${needScore}/100 (${needScoreBand(needScore)})`);
    if (urgencyH < 2) reasons.push("Pickup window closing soon");
    if (expH < 4) reasons.push("Expiration approaching");

    results.push({
      shelterId: shelter.id,
      shelterName: shelter.organizationName ?? shelter.name,
      score: Math.round(score * 10) / 10,
      distanceMiles: Math.round(dist * 10) / 10,
      reasons,
      needScore,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
