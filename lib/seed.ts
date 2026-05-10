import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import type {
  Donation,
  DonorProfile,
  DriverProfile,
  ShelterNeed,
  ShelterProfile,
} from "./types";
import { getData, saveData } from "./store";

/** Davis, CA area — demo coordinates */
const DAVIS = { lat: 38.5449, lng: -121.7405 };

export function seedIfEmpty(passwordPlain = "demo1234") {
  const data = getData();
  if (Object.keys(data.users).length > 0) return;

  const hash = bcrypt.hashSync(passwordPlain, 10);

  const donor: DonorProfile = {
    id: uuid(),
    email: "donor@rescueroute.demo",
    passwordHash: hash,
    name: "Campus Kitchen",
    phone: "5305550100",
    role: "donor",
    organizationName: "Campus Dining",
    locationLabel: "1 Shields Ave, Davis, CA",
    coordinates: { ...DAVIS, lat: DAVIS.lat + 0.01 },
    businessType: "Dining hall",
    typicalFoodCategories: ["prepared_meals", "produce"],
    pickupInstructions: "Ring the loading dock bell.",
    reputationScore: 92,
    completedDonations: 34,
    canceledDonations: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const shelter: ShelterProfile = {
    id: uuid(),
    email: "shelter@rescueroute.demo",
    passwordHash: hash,
    name: "River Community Center",
    phone: "5305550200",
    role: "shelter",
    organizationName: "River Community Center",
    locationLabel: "620 Pole Line Rd, Davis, CA",
    coordinates: { ...DAVIS, lng: DAVIS.lng + 0.02 },
    storageCapacityMeals: 200,
    dietaryRestrictions: [],
    dailyMealDemand: 120,
    acceptedFoodCategories: ["prepared_meals", "produce", "packaged_goods", "mixed"],
    operatingHours: "8am–8pm daily",
    peopleServedEstimate: 85,
    historicalMealsRequested: 900,
    historicalMealsReceived: 820,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const driver: DriverProfile = {
    id: uuid(),
    email: "driver@rescueroute.demo",
    passwordHash: hash,
    name: "Alex Volunteer",
    phone: "5305550300",
    role: "driver",
    organizationName: "",
    locationLabel: "Downtown Davis",
    coordinates: { ...DAVIS, lat: DAVIS.lat - 0.008 },
    vehicleType: "SUV",
    maxDistanceMiles: 15,
    availabilityNotes: "Weekday evenings",
    canRefrigerated: true,
    milesDriven: 142,
    deliveriesCompleted: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.users[donor.id] = donor;
  data.users[shelter.id] = shelter;
  data.users[driver.id] = driver;

  const need: ShelterNeed = {
    id: uuid(),
    shelterId: shelter.id,
    needLevel: "high",
    mealsNeeded: 80,
    acceptedFoodCategories: ["prepared_meals", "produce", "packaged_goods"],
    dietaryRestrictions: [],
    storageCapacityAvailable: 120,
    latestAcceptableDelivery: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    notes: "Especially need prepared meals tonight.",
    updatedAt: new Date().toISOString(),
  };
  data.shelterNeeds[need.id] = need;

  const mealDonation: Donation = {
    id: uuid(),
    donorId: donor.id,
    title: "Boxed lunches — surplus from event",
    foodCategory: "prepared_meals",
    quantityDescription: "40 boxed meals",
    estimatedMeals: 40,
    pickupAddress: donor.locationLabel,
    pickupCoordinates: donor.coordinates,
    earliestPickup: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    latestPickup: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    expirationDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    storageType: "refrigerated",
    dietaryTags: [],
    allergenNotes: "Contains wheat; nuts possible in some boxes.",
    packagingStatus: "Sealed vendor packaging",
    instructions: "Use loading dock; ask for Casey.",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.donations[mealDonation.id] = mealDonation;

  saveData(data);
}
