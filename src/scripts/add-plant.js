import { createPlant } from "../utils/addPlantApi.js";
import { isLoggedIn } from "../state/authState.js";
import { geocodeAddress } from "../utils/mapApi.js";
import { showToast } from "../utils/toastify.js";

// form
const form = document.getElementById("addPlantForm");
const submitBtn = form?.querySelector(".submit-btn");

const nameInput = document.getElementById("plant-name");
const imageInput = document.getElementById("plant-image");
const fileDisplay = document.querySelector(".file-display");
const lightInput = document.getElementById("plant-light");
const descriptionInput = document.getElementById("plant-description");

const authModal = document.getElementById("authModal");
const closeAuthModalBtn = document.getElementById("closeAuthModal");

// SAFE file change (hindrar crash)
if (imageInput && fileDisplay) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    fileDisplay.value = file ? file.name : "";
  });
}

// leaflet 
const map = L.map("addPlantMap").setView([59.3293, 18.0686], 12);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap & CartoDB",
}).addTo(map);

// icon
const plantIcon = L.icon({
  iconUrl: "public/plant.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

let selectedCoordinates = null;
let marker = null;

// set plant location
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  selectedCoordinates = { lat, lng };

  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { icon: plantIcon }).addTo(map);
  }
});

const addressInput = document.getElementById("plant-address");
const searchBtn = document.getElementById("searchAddressBtn");

searchBtn?.addEventListener("click", async () => {
  const address = addressInput?.value?.trim();
  if (!address) return;

  try {
    const coords = await geocodeAddress(address);

    selectedCoordinates = coords;

    map.setView([coords.lat, coords.lng], 15);

    if (marker) {
      marker.setLatLng([coords.lat, coords.lng]);
    } else {
      marker = L.marker([coords.lat, coords.lng], { icon: plantIcon }).addTo(map);
    }

  } catch (err) {
    showToast("Could not find that address.", "error");
  }
});

function openAuthModal() {
  authModal?.classList.remove("hidden");
}

function closeAuthModal() {
  authModal?.classList.add("hidden");
}

closeAuthModalBtn?.addEventListener("click", closeAuthModal);

authModal?.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAuthModal();
});

// submit 
form?.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const token = localStorage.getItem("accessToken");

  const name = nameInput?.value?.trim();
  const imageFile = imageInput?.files?.[0];
  const lightRequirements = Number(lightInput?.value);
  const description = descriptionInput?.value?.trim();

  if (!name || !description || !lightRequirements) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (!imageFile) {
    showToast("Please select an image file.", "error");
    return;
  }

  if (!selectedCoordinates) {
    showToast("Please select a location on the map.", "error");
    return;
  }

  const plantData = new FormData();
  plantData.append("name", name);
  plantData.append("description", description);
  plantData.append("lightRequirements", String(lightRequirements));
  plantData.append("coordinates", JSON.stringify(selectedCoordinates));
  plantData.append("image", imageFile);

  submitBtn.disabled = true;

  try {
    await createPlant(token, plantData);
    
    showToast("Plant added successfully!", "success");
    setTimeout(() => {
        window.location.href = "/profile.html";
    }, 1500);

  } catch (err) {
    console.error(err);
    showToast(err.message || "Something went wrong.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});