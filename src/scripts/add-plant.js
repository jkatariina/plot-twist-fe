import { createPlant } from "../utils/addPlantApi.js";
import { isLoggedIn } from "../state/authState.js";
import { geocodeAddress } from "../utils/mapApi.js";

// form
const form = document.getElementById("addPlantForm");
const submitBtn = form?.querySelector(".submit-btn");

const nameInput = document.getElementById("plant-name");
const imageInput = document.getElementById("plant-image");
const lightInput = document.getElementById("plant-light");
const descriptionInput = document.getElementById("plant-description");

const authModal = document.getElementById("authModal");
const closeAuthModalBtn = document.getElementById("closeAuthModal");

// message
let formMessage = document.getElementById("addPlantMessage");

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

  if (!map || !plantIcon) return;

  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { icon: plantIcon }).addTo(map);
  }
});


const addressInput = document.getElementById("plant-address");
const searchBtn = document.getElementById("searchAddressBtn");

searchBtn.addEventListener("click", async () => {
  const address = addressInput.value.trim();
  if (!address) return;

  try {
    const coords = await geocodeAddress(address);

    selectedCoordinates = coords;

    map.setView([coords.lat, coords.lng], 15);

    setTimeout(() => {
      if (marker) {
        marker.setLatLng([coords.lat, coords.lng]);
      } else {
        marker = L.marker([coords.lat, coords.lng], { icon: plantIcon }).addTo(map);
      }
    }, 150);

  } catch (err) {
    setFormMessage("Could not find that address.");
  }
});


// form message
function setFormMessage(message) {
  if (!formMessage) return;

  if (!message) {
    formMessage.textContent = "";
    formMessage.hidden = true;
    return;
  }

  formMessage.textContent = message;
  formMessage.hidden = false;
}

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
  setFormMessage("");

  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const token = localStorage.getItem("accessToken");

  const name = nameInput?.value.trim();
  const imageFile = imageInput?.files?.[0];
  const lightRequirements = Number(lightInput?.value);
  const description = descriptionInput?.value.trim();

  if (!name || !description || !lightRequirements) {
    setFormMessage("Please fill in all required fields.");
    return;
  }

  if (!imageFile) {
    setFormMessage("Please select an image file.");
    return;
  }

  if (!selectedCoordinates) {
    setFormMessage("Please select a location on the map.");
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
    window.location.href = "/profile.html";
  } catch (err) {
    console.error(err);
    setFormMessage(err.message || "Something went wrong.");
  } finally {
    submitBtn.disabled = false;
  }
});