import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  writeBatch,
  doc,
  getDoc,
  updateDoc,
  increment,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Cached drinks for submit form
let drinksCache = [];

async function loadDrinks() {
  try {
    const snapshot = await getDocs(query(
      collection(window.db, "drinks"),
      where("approved", "==", true),
      orderBy("name")
    ));
    drinksCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading drinks:", error);
  }
}

async function loadDrinkReviews(drinkId) {
  try {
    const snapshot = await getDocs(query(
      collection(window.db, "reviews"),
      where("drink_id", "==", drinkId),
      orderBy("created_at", "desc")
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading reviews:", error);
    return [];
  }
}

async function getRecentReviews(limitNum = 6) {
  try {
    const snapshot = await getDocs(query(
      collection(window.db, "reviews"),
      orderBy("created_at", "desc"),
      limit(limitNum)
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading recent reviews:", error);
    return [];
  }
}

async function submitReview(drinkId, drinkName, metrics, notes, imageUrl) {
  if (!window.currentUser) {
    alert("Please sign in to submit a review");
    return false;
  }

  if (!drinkId || !drinkName) {
    alert("Please select a drink");
    return false;
  }

  const overall = Math.round(
    (metrics.drinkability + metrics.time_to_empty + metrics.energy_boost +
     metrics.taste + metrics.value) / 5 * 10
  ) / 10;

  try {
    const batch = writeBatch(window.db);

    // Add review
    const reviewRef = doc(collection(window.db, "reviews"));
    batch.set(reviewRef, {
      drink_id: drinkId,
      drink_name: drinkName,
      user_id: window.currentUser.uid,
      user_display_name: window.currentUser.displayName || "Anonymous",
      drinkability: metrics.drinkability,
      time_to_empty: metrics.time_to_empty,
      energy_boost: metrics.energy_boost,
      taste: metrics.taste,
      value: metrics.value,
      overall: overall,
      notes: notes,
      image_url: imageUrl || null,
      created_at: Timestamp.now()
    });

    // Update drink aggregates
    const drinkRef = doc(window.db, "drinks", drinkId);
    const drinkSnap = await getDoc(drinkRef);

    if (drinkSnap.exists()) {
      const data = drinkSnap.data();
      const count = data.review_count || 0;

      const newCount = count + 1;
      const avg = (prev, new_val) => (prev * count + new_val) / newCount;

      batch.update(drinkRef, {
        review_count: newCount,
        avg_drinkability: avg(data.avg_drinkability || 0, metrics.drinkability),
        avg_time_to_empty: avg(data.avg_time_to_empty || 0, metrics.time_to_empty),
        avg_energy_boost: avg(data.avg_energy_boost || 0, metrics.energy_boost),
        avg_taste: avg(data.avg_taste || 0, metrics.taste),
        avg_value: avg(data.avg_value || 0, metrics.value),
        avg_overall: avg(data.avg_overall || 0, overall)
      });
    }

    // Update user review count
    const userRef = doc(window.db, "users", window.currentUser.uid);
    batch.update(userRef, {
      review_count: increment(1)
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Error submitting review: " + error.message);
    return false;
  }
}

async function createDrink(name) {
  if (!window.currentUser) return null;

  try {
    const docRef = await addDoc(collection(window.db, "drinks"), {
      name: name,
      variant: name,
      image_url: "",
      submitted_by: window.currentUser.uid,
      approved: false,
      review_count: 0,
      avg_drinkability: 0,
      avg_time_to_empty: 0,
      avg_energy_boost: 0,
      avg_taste: 0,
      avg_value: 0,
      avg_overall: 0
    });
    return { id: docRef.id, name, variant: name, approved: false };
  } catch (error) {
    console.error("Error creating drink:", error);
    return null;
  }
}

// Global exports
window.loadDrinks = loadDrinks;
window.loadDrinkReviews = loadDrinkReviews;
window.getRecentReviews = getRecentReviews;
window.submitReview = submitReview;
window.createDrink = createDrink;
window.drinksCache = drinksCache;
