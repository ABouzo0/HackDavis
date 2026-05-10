export const FOOD_CATEGORIES = [
  "prepared_meals",
  "bakery",
  "produce",
  "packaged_goods",
  "dairy",
  "frozen",
  "beverages",
  "mixed",
] as const;

export const STORAGE_TYPES = [
  "shelf_stable",
  "refrigerated",
  "frozen",
  "hot_food",
  "room_temp_prepared",
] as const;

export const DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "gluten_free",
  "nut_free",
  "dairy_free",
  "contains_common_allergens",
] as const;

export const NEED_LEVELS = ["low", "medium", "high", "urgent"] as const;

export const USER_ROLES = ["donor", "shelter", "driver", "admin"] as const;

export const FOOD_CATEGORY_LABELS: Record<(typeof FOOD_CATEGORIES)[number], string> = {
  prepared_meals: "Prepared meals",
  bakery: "Bakery",
  produce: "Produce",
  packaged_goods: "Packaged goods",
  dairy: "Dairy",
  frozen: "Frozen",
  beverages: "Beverages",
  mixed: "Mixed donation",
};

export const STORAGE_LABELS: Record<(typeof STORAGE_TYPES)[number], string> = {
  shelf_stable: "Shelf-stable",
  refrigerated: "Refrigerated",
  frozen: "Frozen",
  hot_food: "Hot food",
  room_temp_prepared: "Room temperature prepared",
};

export const DIETARY_LABELS: Record<(typeof DIETARY_TAGS)[number], string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  kosher: "Kosher",
  gluten_free: "Gluten-free",
  nut_free: "Nut-free",
  dairy_free: "Dairy-free",
  contains_common_allergens: "Contains common allergens",
};

/** Rough average meal weight and CO2 avoided (lbs CO2 per lb food) for MVP impact. */
export const IMPACT_CO2_PER_LB_FOOD = 3.3;
export const DEFAULT_MEAL_WEIGHT_LB = 1.2;
