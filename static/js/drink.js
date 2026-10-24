import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

async function loadDrink(drinkId) {
  try {
    const snapshot = await getDoc(doc(window.db, "drinks", drinkId));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error loading drink:", error);
    return null;
  }
}

async function renderDrinkDetail() {
  const params = new URLSearchParams(window.location.search);
  const drinkId = params.get("id");

  if (!drinkId) {
    document.querySelector(".main-content").innerHTML = "<p>Drink not found.</p>";
    return;
  }

  const drink = await window.loadDrink(drinkId);
  if (!drink) {
    document.querySelector(".main-content").innerHTML = "<p>Drink not found.</p>";
    return;
  }

  const reviews = await window.loadDrinkReviews(drinkId);

  const reviewsHtml = reviews.length > 0
    ? reviews.map(review => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <strong>${review.user_display_name}</strong>
            <span class="text-muted">${new Date(review.created_at?.toDate?.() || Date.now()).toLocaleDateString()}</span>
          </div>
          <div class="rating-bar">
            <span class="rating-label">Overall:</span>
            <span class="rating-value">${review.overall}/5</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
            <div>
              <small class="text-muted">Drinkability</small>
              <div style="color: var(--green); font-weight: bold;">${review.drinkability}/5</div>
            </div>
            <div>
              <small class="text-muted">Time to Empty</small>
              <div style="color: var(--green); font-weight: bold;">${review.time_to_empty}/5</div>
            </div>
            <div>
              <small class="text-muted">Energy Boost</small>
              <div style="color: var(--green); font-weight: bold;">${review.energy_boost}/5</div>
            </div>
            <div>
              <small class="text-muted">Taste</small>
              <div style="color: var(--green); font-weight: bold;">${review.taste}/5</div>
            </div>
          </div>
          ${review.notes ? `<p class="text-muted">${review.notes}</p>` : ""}
          ${review.image_url ? `<img src="${review.image_url}" style="max-width: 100%; height: auto; border-radius: 4px; margin-top: 1rem;">` : ""}
        </div>
      `).join("")
    : `<p class="text-muted">No reviews yet. <a href="/submit/?drink=${drinkId}" style="color: var(--green);">Be the first to review!</a></p>`;

  document.querySelector(".main-content").innerHTML = `
    <div class="container">
      <div class="hero">
        <h2>${drink.name}</h2>
        ${drink.image_url ? `<img src="${drink.image_url}" style="max-width: 200px; margin: 2rem 0;">` : ""}
        <button class="btn btn-primary" onclick="window.location.href='/submit/?drink=${drink.id}'">Submit Your Review</button>
      </div>

      <div class="p-4">
        <h3 style="margin-bottom: 2rem; color: var(--green);">Aggregate Scores</h3>

        <div class="rating-bar">
          <span class="rating-label">Drinkability</span>
          <div class="rating-fill">
            <div class="rating-progress" style="width: ${(drink.avg_drinkability || 0) * 20}%"></div>
          </div>
          <span class="rating-value">${(drink.avg_drinkability || 0).toFixed(1)}/5</span>
        </div>

        <div class="rating-bar">
          <span class="rating-label">Time to Empty</span>
          <div class="rating-fill">
            <div class="rating-progress" style="width: ${(drink.avg_time_to_empty || 0) * 20}%"></div>
          </div>
          <span class="rating-value">${(drink.avg_time_to_empty || 0).toFixed(1)}/5</span>
        </div>

        <div class="rating-bar">
          <span class="rating-label">Energy Boost</span>
          <div class="rating-fill">
            <div class="rating-progress" style="width: ${(drink.avg_energy_boost || 0) * 20}%"></div>
          </div>
          <span class="rating-value">${(drink.avg_energy_boost || 0).toFixed(1)}/5</span>
        </div>

        <div class="rating-bar">
          <span class="rating-label">Taste</span>
          <div class="rating-fill">
            <div class="rating-progress" style="width: ${(drink.avg_taste || 0) * 20}%"></div>
          </div>
          <span class="rating-value">${(drink.avg_taste || 0).toFixed(1)}/5</span>
        </div>

        <div class="rating-bar">
          <span class="rating-label">Value</span>
          <div class="rating-fill">
            <div class="rating-progress" style="width: ${(drink.avg_value || 0) * 20}%"></div>
          </div>
          <span class="rating-value">${(drink.avg_value || 0).toFixed(1)}/5</span>
        </div>

        <h3 style="margin: 2rem 0 1rem; color: var(--green);">Reviews (${reviews.length})</h3>
        <div style="display: grid; gap: 1.5rem;">
          ${reviewsHtml}
        </div>
      </div>
    </div>
  `;
}

// Global exports
window.loadDrink = loadDrink;
window.renderDrinkDetail = renderDrinkDetail;
