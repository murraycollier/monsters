import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

async function loadLeaderboard(sortBy = "avg_overall", limitNum = 100) {
  try {
    const q = query(
      collection(window.db, "drinks"),
      where("approved", "==", true),
      where("review_count", ">", 0),
      orderBy("review_count", "desc"),
      orderBy(sortBy, "desc"),
      limit(limitNum)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    return [];
  }
}

async function renderLeaderboard(sortBy = "avg_overall") {
  const drinks = await loadLeaderboard(sortBy);
  const table = document.querySelector("table tbody");

  if (!table) return;

  table.innerHTML = drinks.map(drink => `
    <tr onclick="window.location.href='/drink/?id=${drink.id}'">
      <td>#${drink.rank}</td>
      <td><strong>${drink.name}</strong></td>
      <td>${(drink.avg_drinkability || 0).toFixed(1)}/5</td>
      <td>${(drink.avg_time_to_empty || 0).toFixed(1)}/5</td>
      <td>${(drink.avg_energy_boost || 0).toFixed(1)}/5</td>
      <td>${(drink.avg_taste || 0).toFixed(1)}/5</td>
      <td>${(drink.avg_value || 0).toFixed(1)}/5</td>
      <td><strong style="color: var(--green)">${(drink.avg_overall || 0).toFixed(1)}/5</strong></td>
    </tr>
  `).join("");
}

// Global exports
window.loadLeaderboard = loadLeaderboard;
window.renderLeaderboard = renderLeaderboard;
