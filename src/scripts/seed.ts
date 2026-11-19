import { getDb } from "../lib/db";
import { seed, LIKED_ME } from "../lib/seed";

const result = seed(getDb());
console.log(`Seeded ${result.profiles} profiles`);
console.log(`Pre-liked you (for demo matches): ${LIKED_ME.join(", ")}`);