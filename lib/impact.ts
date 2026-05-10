import { DEFAULT_MEAL_WEIGHT_LB, IMPACT_CO2_PER_LB_FOOD } from "./constants";
import type { Donation, DriverProfile, ImpactStats, UserProfile } from "./types";

export function computeGlobalImpact(
  donations: Donation[],
  users: Record<string, UserProfile>,
): ImpactStats {
  const completed = donations.filter((d) => d.status === "completed");
  let mealsRescued = 0;
  let poundsFoodSaved = 0;
  const shelterIds = new Set<string>();

  for (const d of completed) {
    mealsRescued += d.estimatedMeals;
    poundsFoodSaved += d.estimatedMeals * DEFAULT_MEAL_WEIGHT_LB;
    if (d.shelterId) shelterIds.add(d.shelterId);
  }

  const volunteerMiles = Object.values(users)
    .filter((u): u is DriverProfile => u.role === "driver")
    .reduce((acc, d) => acc + d.milesDriven, 0);

  const co2AvoidedLbs = poundsFoodSaved * IMPACT_CO2_PER_LB_FOOD;

  return {
    mealsRescued,
    poundsFoodSaved: Math.round(poundsFoodSaved),
    co2AvoidedLbs: Math.round(co2AvoidedLbs),
    sheltersServed: shelterIds.size,
    volunteerMiles: Math.round(volunteerMiles * 10) / 10,
    donationsCompleted: completed.length,
  };
}

export function estimateMealCarbonLbs(meals: number): number {
  return Math.round(meals * DEFAULT_MEAL_WEIGHT_LB * IMPACT_CO2_PER_LB_FOOD);
}
