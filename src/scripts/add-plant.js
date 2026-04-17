import { createPlant } from "../utils/addPlantApi.js";
import { isLoggedIn } from "../state/authState.js";

const form = document.getElementById("addPlantForm");
const submitBtn = form?.querySelector(".submit-btn");
const authModal = document.getElementById("authModal");
const closeAuthModalBtn = document.getElementById("closeAuthModal");

const nameInput = document.getElementById("plant-name");
const imageInput = document.getElementById("plant-image");
const lightInput = document.getElementById("plant-light");
const descriptionInput = document.getElementById("plant-description");
const locationInput = document.getElementById("plant-location");

let formMessage = document.getElementById("addPlantMessage");

if (!formMessage && form) {
  formMessage = document.createElement("p");
  formMessage.id = "addPlantMessage";
  formMessage.classList.add("form-message");
  formMessage.hidden = true;
  submitBtn?.insertAdjacentElement("beforebegin", formMessage);
}

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

function getCoordinates(location) {
  const coordinatesByLocation = {
    stockholm: { lat: 59.3293, lng: 18.0686 },
    goteborg: { lat: 57.7089, lng: 11.9746 },
    malmo: { lat: 55.605, lng: 13.0038 },
    sundsvall: { lat: 62.3908, lng: 17.3069 },
  };

  return coordinatesByLocation[location] || coordinatesByLocation.stockholm;
}

closeAuthModalBtn?.addEventListener("click", closeAuthModal);

authModal?.addEventListener("click", (event) => {
  if (event.target === authModal) {
    closeAuthModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authModal && !authModal.classList.contains("hidden")) {
    closeAuthModal();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormMessage("");

  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const token = localStorage.getItem("accessToken");
  const name = nameInput?.value.trim();
  const image = imageInput?.value.trim();
  const lightRequirements = Number(lightInput?.value);
  const description = descriptionInput?.value.trim();
  const location = locationInput?.value;

  if (!name || !description || !location || !lightRequirements) {
    setFormMessage("Please fill in plant name, location, light level and description.");
    return;
  }

  const coordinates = getCoordinates(location);
  const plantData = {
    name,
    image,
    description,
    lightRequirements,
    coordinates: {
      lat: coordinates.lat + Math.random() * 0.001,
      lng: coordinates.lng + Math.random() * 0.001,
    },
  };

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  try {
    await createPlant(token, plantData);
    window.location.href = "/profile.html";
  } catch (error) {
    console.error("Error creating plant:", error);
    setFormMessage(error.message || "Something went wrong. Please try again.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
});
