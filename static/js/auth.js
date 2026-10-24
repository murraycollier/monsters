import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

function openAuthModal() {
  document.getElementById("auth-modal").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
  clearAuthErrors();
}

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(content => content.classList.add("hidden"));

  event.target.classList.add("active");
  document.getElementById(tab + "-form").classList.remove("hidden");
  clearAuthErrors();
}

function clearAuthErrors() {
  document.getElementById("auth-error").textContent = "";
}

async function signUpEmail() {
  clearAuthErrors();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!name || !email || !password) {
    showAuthError("Please fill in all fields");
    return;
  }

  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(window.auth, email, password);
    const user = result.user;

    // Create user profile doc
    await setDoc(doc(window.db, "users", user.uid), {
      display_name: name,
      avatar_url: "",
      review_count: 0,
      joined_at: new Date()
    });

    closeAuthModal();
    updateAuthUI();
  } catch (error) {
    showAuthError(error.message);
  }
}

async function signInEmail() {
  clearAuthErrors();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;

  if (!email || !password) {
    showAuthError("Please enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(window.auth, email, password);
    closeAuthModal();
    updateAuthUI();
  } catch (error) {
    showAuthError(error.message);
  }
}

async function signInGoogle() {
  clearAuthErrors();
  try {
    const result = await signInWithPopup(window.auth, googleProvider);
    const user = result.user;

    // Check if user profile exists; create if not
    const userDoc = await getDoc(doc(window.db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(window.db, "users", user.uid), {
        display_name: user.displayName || "Google User",
        avatar_url: user.photoURL || "",
        review_count: 0,
        joined_at: new Date()
      });
    }

    closeAuthModal();
    updateAuthUI();
  } catch (error) {
    showAuthError(error.message);
  }
}

async function logout() {
  try {
    await signOut(window.auth);
    updateAuthUI();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function updateAuthUI() {
  const user = window.currentUser;
  const signInBtn = document.getElementById("nav-auth-btn");
  const profileBtn = document.getElementById("nav-profile-btn");
  const logoutBtn = document.getElementById("nav-logout-btn");

  if (user) {
    signInBtn.classList.add("hidden");
    profileBtn.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    signInBtn.classList.remove("hidden");
    profileBtn.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }
}

function showAuthError(message) {
  document.getElementById("auth-error").textContent = message;
}

function goToProfile() {
  if (window.currentUser) {
    window.location.href = `/profile/?uid=${window.currentUser.uid}`;
  }
}

// Global exports
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchTab = switchTab;
window.signUpEmail = signUpEmail;
window.signInEmail = signInEmail;
window.signInGoogle = signInGoogle;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
window.goToProfile = goToProfile;
