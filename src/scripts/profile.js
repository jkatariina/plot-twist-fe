import { getBaseUrl } from "../utils/api.js";

const token = localStorage.getItem("token");

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    return null;
  }
}

const decoded = token ? parseJwt(token) : null;

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const plantsContainer = document.querySelector(".profile-plants");

if (decoded) {
  if (nameEl) {
    nameEl.textContent = decoded.email.split("@")[0];
  }

  if (emailEl) {
    emailEl.textContent = decoded.email;
  }
}

function insertBeforeAbout(element) {
  const aboutBox = plantsContainer.querySelector(".about-box");

  if (aboutBox) {
    plantsContainer.insertBefore(element, aboutBox);
  } else {
    plantsContainer.appendChild(element);
  }
}

async function loadUserPlants() {
  if (!decoded || !token || !plantsContainer) return;

  try {
    const baseUrl = getBaseUrl();
    const userId = decoded.id;

    const response = await fetch(`${baseUrl}/auth/${userId}/plants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch plants");
    }

    const oldCards = plantsContainer.querySelectorAll(".plant-card, .empty-state");
    oldCards.forEach((el) => el.remove());

    if (!Array.isArray(data) || data.length === 0) {
      const empty = document.createElement("p");
      empty.classList.add("empty-state");
      empty.textContent = "You have no plants yet.";
      insertBeforeAbout(empty);
      return;
    }

    data.forEach((plant) => {
      const card = document.createElement("div");
      card.classList.add("plant-card");

      card.innerHTML = `
        <div>
          <strong>${plant.name ?? "Unnamed plant"}</strong>
          <p>${plant.location ?? "No location"}</p>
        </div>
      `;

      insertBeforeAbout(card);
    });
  } catch (error) {
    console.error("Plants could not be loaded:", error);

    const oldCards = plantsContainer.querySelectorAll(".plant-card, .empty-state");
    oldCards.forEach((el) => el.remove());

    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = "No plants to show yet.";
    insertBeforeAbout(empty);
  }
}

loadUserPlants();