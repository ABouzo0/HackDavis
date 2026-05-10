import { seedIfEmpty } from "./seed";

let seeded = false;

export function ensureDemoSeed() {
  if (!seeded) {
    seedIfEmpty();
    seeded = true;
  }
}
