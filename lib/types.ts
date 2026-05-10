import type {
  DIETARY_TAGS,
  FOOD_CATEGORIES,
  NEED_LEVELS,
  STORAGE_TYPES,
  USER_ROLES,
} from "./constants";

export type UserRole = (typeof USER_ROLES)[number];
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
export type StorageType = (typeof STORAGE_TYPES)[number];
export type DietaryTag = (typeof DIETARY_TAGS)[number];
export type NeedLevel = (typeof NEED_LEVELS)[number];

export type Coordinates = { lat: number; lng: number };

export type BaseProfile = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: UserRole;
  organizationName?: string;
  locationLabel: string;
  coordinates: Coordinates;
  createdAt: string;
  updatedAt: string;
};

export type DonorProfile = BaseProfile & {
  role: "donor";
  businessType: string;
  typicalFoodCategories: FoodCategory[];
  pickupInstructions: string;
  reputationScore: number;
  completedDonations: number;
  canceledDonations: number;
};

export type ShelterProfile = BaseProfile & {
  role: "shelter";
  storageCapacityMeals: number;
  dietaryRestrictions: DietaryTag[];
  dailyMealDemand: number;
  acceptedFoodCategories: FoodCategory[];
  operatingHours: string;
  peopleServedEstimate: number;
  historicalMealsRequested: number;
  historicalMealsReceived: number;
};

export type DriverProfile = BaseProfile & {
  role: "driver";
  vehicleType: string;
  maxDistanceMiles: number;
  availabilityNotes: string;
  canRefrigerated: boolean;
  milesDriven: number;
  deliveriesCompleted: number;
};

export type AdminProfile = BaseProfile & {
  role: "admin";
};

export type UserProfile = DonorProfile | ShelterProfile | DriverProfile | AdminProfile;

export type DonationStatus = "open" | "matched" | "in_transit" | "completed" | "canceled";

export type Donation = {
  id: string;
  donorId: string;
  title: string;
  foodCategory: FoodCategory;
  quantityDescription: string;
  estimatedMeals: number;
  pickupAddress: string;
  pickupCoordinates: Coordinates;
  earliestPickup: string;
  latestPickup: string;
  expirationDeadline: string;
  storageType: StorageType;
  dietaryTags: DietaryTag[];
  allergenNotes: string;
  packagingStatus: string;
  photoUrl?: string;
  instructions: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  shelterId?: string;
  driverId?: string;
  safetyChecklistPickup?: SafetyChecklist;
  safetyChecklistDropoff?: SafetyChecklist;
  /** Set when the receiving shelter confirms the handoff arrived (required before marking complete). */
  shelterReceiptConfirmedAt?: string;
};

export type SafetyChecklist = {
  sealedPackaging: boolean;
  withinPickupWindow: boolean;
  refrigeratedOk?: boolean;
  allergensLabeled: boolean;
  quantityMatches: boolean;
  notSpoiled: boolean;
  completedAt: string;
};

export type ShelterNeed = {
  id: string;
  shelterId: string;
  needLevel: NeedLevel;
  mealsNeeded: number;
  acceptedFoodCategories: FoodCategory[];
  dietaryRestrictions: DietaryTag[];
  storageCapacityAvailable: number;
  latestAcceptableDelivery: string;
  notes: string;
  updatedAt: string;
};

export type MatchRecommendation = {
  shelterId: string;
  shelterName: string;
  score: number;
  distanceMiles: number;
  reasons: string[];
  needScore: number;
};

export type ImpactStats = {
  mealsRescued: number;
  poundsFoodSaved: number;
  co2AvoidedLbs: number;
  sheltersServed: number;
  volunteerMiles: number;
  donationsCompleted: number;
};

export type AppData = {
  users: Record<string, UserProfile>;
  donations: Record<string, Donation>;
  shelterNeeds: Record<string, ShelterNeed>;
  sessions: Record<string, { userId: string; expiresAt: string }>;
};
