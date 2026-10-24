import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

async function loadUserProfile(userId) {
  try {
    const snapshot = await getDoc(doc(window.db, "users", userId));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error loading user profile:", error);
    return null;
  }
}

async function loadUserReviews(userId) {
  try {
    const snapshot = await getDocs(query(
      collection(window.db, "reviews"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading user reviews:", error);
    return [];
  }
}

async function renderProfile() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("uid");

  if (!userId) {
    document.querySelector(".main-content").innerHTML = "<p>User not found.</p>";
    return;
  }

  const user = await window.loadUserProfile(userId);
  if (!user) {
    document.querySelector(".main-content").innerHTML = "<p>User not found.</p>";
    return;
  }

  const reviews = await window.loadUserReviews(userId);

  const reviewsHtml = reviews.length > 0
    ? reviews.map(review => `
        <div class="card" onclick="window.location.href='/drink/?id=${review.drink_id}'">
          <div class="card-title">${review.drink_name}</div>
          <div style="color: var(--green); font-weight: bold; margin: 0.5rem 0;">
            Overall: ${review.overall}/5
          </div>
          ${review.notes ? `<p class="text-muted">${review.notes}</p>` : ""}
          ${review.image_url ? `<img src="${review.image_url}" style="max-width: 100%; height: auto; border-radius: 4px; margin-top: 1rem;">` : ""}
          <small class="text-muted">${new Date(review.created_at?.toDate?.() || Date.now()).toLocaleDateString()}</small>
        </div>
      `).join("")
    : `<p class="text-muted">No reviews yet. <a href="/submit/" style="color: var(--green);">Submit your first review!</a></p>`;

  document.querySelector(".main-content").innerHTML = `
    <div class="container">
      <div class="hero">
        <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
        <h2>${user.display_name}</h2>
        <p>Member since ${new Date(user.joined_at?.toDate?.() || Date.now()).toLocaleDateString()}</p>
        <p style="color: var(--green); font-size: 1.5rem; font-weight: bold;">${user.review_count || 0} Reviews</p>
      </div>

      <div class="p-4">
        <h3 style="margin-bottom: 2rem; color: var(--green);">Reviews</h3>
        <div class="grid grid-3">
          ${reviewsHtml}
        </div>
      </div>
    </div>
  `;
}

// Global exports
window.loadUserProfile = loadUserProfile;
window.loadUserReviews = loadUserReviews;
window.renderProfile = renderProfile;
