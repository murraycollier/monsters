// Node.js script to seed Firestore with initial Monster drink catalogue
// Run: node seed-drinks.js (after setting up Firebase credentials)

import admin from "firebase-admin";
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const drinks = [
  { name: "Monster Energy Original", variant: "Original" },
  { name: "Monster Ultra White", variant: "Ultra White" },
  { name: "Monster Ultra Red", variant: "Ultra Red" },
  { name: "Monster Ultra Blue", variant: "Ultra Blue" },
  { name: "Monster Ultra Sunrise", variant: "Ultra Sunrise" },
  { name: "Monster Ultra Violet", variant: "Ultra Violet" },
  { name: "Monster Ultra Gold", variant: "Ultra Gold" },
  { name: "Monster Ultra Watermelon", variant: "Ultra Watermelon" },
  { name: "Monster Pipeline Punch", variant: "Pipeline Punch" },
  { name: "Monster Mango Loco", variant: "Mango Loco" },
  { name: "Monster Pacific Punch", variant: "Pacific Punch" },
  { name: "Monster Papillon Punch", variant: "Papillon Punch" },
  { name: "Monster Assault", variant: "Assault" },
  { name: "Monster Khaos", variant: "Khaos" },
  { name: "Monster Rehab Lemonade", variant: "Rehab Lemonade" },
  { name: "Monster Rehab Tea", variant: "Rehab Tea" },
  { name: "Java Monster Mean Bean", variant: "Mean Bean" },
  { name: "Java Monster Loca Moca", variant: "Loca Moca" },
  { name: "Monster Hydro Mango", variant: "Hydro Mango" },
  { name: "Monster Hydro Blue Ice", variant: "Hydro Blue Ice" },
  { name: "Monster Lo-Carb", variant: "Lo-Carb" },
  { name: "Monster Absolutely Zero", variant: "Absolutely Zero" },
  { name: "Monster Import", variant: "Import" },
  { name: "Reign Orange Dreamsicle", variant: "Orange Dreamsicle" },
  { name: "Reign Lemon HDZ", variant: "Lemon HDZ" }
];

async function seedDrinks() {
  console.log("Seeding drinks...");
  let count = 0;

  for (const drink of drinks) {
    try {
      await db.collection("drinks").add({
        name: drink.name,
        variant: drink.variant,
        image_url: "",
        submitted_by: "admin",
        approved: true,
        review_count: 0,
        avg_drinkability: 0,
        avg_time_to_empty: 0,
        avg_energy_boost: 0,
        avg_taste: 0,
        avg_value: 0,
        avg_overall: 0
      });
      count++;
      console.log(`✓ Added: ${drink.name}`);
    } catch (error) {
      console.error(`✗ Error adding ${drink.name}:`, error);
    }
  }

  console.log(`\nSeeded ${count} drinks successfully!`);
  process.exit(0);
}

seedDrinks().catch(error => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
