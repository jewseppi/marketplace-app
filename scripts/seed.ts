#!/usr/bin/env tsx

import { initDB } from "../src/db";
import { reseedProductCatalog } from "../src/db/seed";

const db = initDB();
const result = reseedProductCatalog(db);

console.log(`Seeded ${result.count} products into data/marketplace.db`);
