import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

async function uploadDrinkImage(file) {
  if (!file) return null;

  const storageRef = ref(window.storage, `reviews/${Date.now()}_${file.name}`);
  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

window.uploadDrinkImage = uploadDrinkImage;
