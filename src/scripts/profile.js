import { getProfile } from "../utils/profileApi.js";

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const imageEl = document.getElementById("userImage");
const aboutEl = document.getElementById("profileAbout");
const plantCountBadge = document.getElementById("plantCountBadge");
const userStatusBadge = document.getElementById("userStatusBadge");
const plantsContainer = document.getElementById("plantsContainer");
const tradesContainer = document.getElementById("tradesContainer");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

initProfile();

async function initProfile() {
  try {
    const user = await getProfile(token);
    renderProfile(user);
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

// profile
function renderProfile(user) {

  nameEl.textContent = user.name || "Unknown";
  emailEl.textContent = user.email;

  const fallbackImage = "public/blank-profile-picture.svg";
  imageEl.src = user.image || fallbackImage;

  imageEl.onerror = () => {
    imageEl.src = fallbackImage;
  };

  if (!user.about) {
    aboutEl.textContent = "No bio yet";
    aboutEl.classList.add("empty-state");
  } else {
    aboutEl.textContent = user.about;
    aboutEl.classList.remove("empty-state");
  }

  plantCountBadge.textContent = `${user.plants?.length || 0} plants`;

  userStatusBadge.textContent = user.verified
    ? "Verified swapper"
    : "Unverified";

  renderPlants(user.plants || []);
  renderActiveTrades(user.trades || []);
  renderCompletedTrades(user.trades || []);
}

function renderPlants(plants) {
  plantsContainer.innerHTML = "";

  if (!plants.length) {
    plantsContainer.innerHTML =
      `<p class="empty-state">No plants yet</p>`;
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.classList.add("plant-card");

    card.innerHTML = `
      <img src="${plant.image || "/images/plant-placeholder.png"}" />
      <div>
        <strong>${plant.name}</strong>
        <p>${plant.location || ""}</p>
      </div>
    `;

    plantsContainer.appendChild(card);
  });
}

// active trades
function renderActiveTrades(trades) {
  const active = trades.filter(
    (t) => t.status === "active" || t.status === "pending"
  );

  activeTradesContainer.innerHTML = "";

  if (!active.length) {
    activeTradesContainer.innerHTML =
      `<p class="empty-state">No active swaps</p>`;
    return;
  }

  active.forEach((trade) => {
    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <div>
        <strong>${trade.plantName}</strong>
        <p>With ${trade.withUser || "Unknown user"}</p>
      </div>
      <span class="badge">Pending</span>
    `;

    activeTradesContainer.appendChild(card);
  });
}

// completed trades
function renderCompletedTrades(trades) {
  const completed = trades.filter((t) => t.status === "completed");

  tradesContainer.innerHTML = "";

  if (!completed.length) {
    tradesContainer.innerHTML =
      `<p class="empty-state">No completed swaps</p>`;
    return;
  }

  completed.forEach((trade) => {
    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <div>
        <strong>${trade.plantName}</strong>
        <p>With ${trade.withUser}</p>
      </div>
      <span class="badge">Completed</span>
    `;

    tradesContainer.appendChild(card);
  });
}