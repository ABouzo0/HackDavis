import { z } from "zod";
import { DIETARY_TAGS, FOOD_CATEGORIES, NEED_LEVELS, STORAGE_TYPES, USER_ROLES } from "./constants";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().min(7),
  role: z.enum(USER_ROLES),
  organizationName: z.string().optional(),
  locationLabel: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  donor: z
    .object({
      businessType: z.string(),
      typicalFoodCategories: z.array(z.enum(FOOD_CATEGORIES)).min(1),
      pickupInstructions: z.string(),
    })
    .optional(),
  shelter: z
    .object({
      storageCapacityMeals: z.number().positive(),
      dietaryRestrictions: z.array(z.enum(DIETARY_TAGS)),
      dailyMealDemand: z.number().nonnegative(),
      acceptedFoodCategories: z.array(z.enum(FOOD_CATEGORIES)).min(1),
      operatingHours: z.string(),
      peopleServedEstimate: z.number().nonnegative(),
      historicalMealsRequested: z.number().nonnegative(),
      historicalMealsReceived: z.number().nonnegative(),
    })
    .optional(),
  driver: z
    .object({
      vehicleType: z.string(),
      maxDistanceMiles: z.number().positive(),
      availabilityNotes: z.string(),
      canRefrigerated: z.boolean(),
    })
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const donationCreateSchema = z.object({
  title: z.string().min(1),
  foodCategory: z.enum(FOOD_CATEGORIES),
  quantityDescription: z.string().min(1),
  estimatedMeals: z.number().positive(),
  pickupAddress: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  earliestPickup: z.string(),
  latestPickup: z.string(),
  expirationDeadline: z.string(),
  storageType: z.enum(STORAGE_TYPES),
  dietaryTags: z.array(z.enum(DIETARY_TAGS)),
  allergenNotes: z.string(),
  packagingStatus: z.string().min(1),
  photoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  instructions: z.string(),
});

export const shelterNeedSchema = z.object({
  needLevel: z.enum(NEED_LEVELS),
  mealsNeeded: z.number().nonnegative(),
  acceptedFoodCategories: z.array(z.enum(FOOD_CATEGORIES)).min(1),
  dietaryRestrictions: z.array(z.enum(DIETARY_TAGS)),
  storageCapacityAvailable: z.number().nonnegative(),
  latestAcceptableDelivery: z.string(),
  notes: z.string(),
});

export const safetyChecklistSchema = z.object({
  phase: z.enum(["pickup", "dropoff"]),
  sealedPackaging: z.boolean(),
  withinPickupWindow: z.boolean(),
  refrigeratedOk: z.boolean().optional(),
  allergensLabeled: z.boolean(),
  quantityMatches: z.boolean(),
  notSpoiled: z.boolean(),
});
