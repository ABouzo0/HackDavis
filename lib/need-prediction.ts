import type { ShelterNeed, ShelterProfile } from "./types";

/**
 * Rule-based shelter need score 0–100 for MVP (SPEC §4.4).
 */
export function computeShelterNeedScore(
  shelter: ShelterProfile,
  need?: ShelterNeed,
  now: Date = new Date(),
): number {
  const needWeights: Record<string, number> = {
    low: 15,
    medium: 35,
    high: 55,
    urgent: 75,
  };

  const baseNeed = need ? needWeights[need.needLevel] ?? 20 : 20;

  const requested = Math.max(1, shelter.historicalMealsRequested);
  const received = shelter.historicalMealsReceived;
  const missedRatio = Math.min(1, Math.max(0, (requested - received) / requested));
  const missedDonationBonus = missedRatio * 25;

  const day = now.getUTCDay();
  const isWeekend = day === 0 || day === 6;
  const dayBonus = isWeekend ? 8 : 0;

  const hour = now.getHours();
  let timeOfDayBonus = 0;
  if (hour >= 11 && hour <= 13) timeOfDayBonus = 6;
  if (hour >= 17 && hour <= 19) timeOfDayBonus = Math.max(timeOfDayBonus, 8);

  const recentWindowHours = 24;
  const recentMealsApprox = received * (recentWindowHours / (24 * 14));
  const recentDonationPenalty = Math.min(20, recentMealsApprox * 0.5);

  const capacityPressure = Math.min(
    25,
    (need?.mealsNeeded ?? shelter.dailyMealDemand) /
      Math.max(1, shelter.storageCapacityMeals) *
      20,
  );

  const urgencyBonus =
    need?.needLevel === "urgent" ? 12 : need?.needLevel === "high" ? 6 : 0;

  let score =
    baseNeed +
    urgencyBonus +
    missedDonationBonus -
    recentDonationPenalty +
    timeOfDayBonus +
    dayBonus +
    capacityPressure;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

export function needScoreBand(score: number): "low" | "moderate" | "high" | "urgent" {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  if (score <= 85) return "high";
  return "urgent";
}
