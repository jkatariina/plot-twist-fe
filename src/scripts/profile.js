import { getProfile, getPlants } from "../utils/profileApi.js";

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const imageEl = document.getElementById("userImage");
const aboutEl = document.getElementById("profileAbout");
const plantCountBadge = document.getElementById("plantCountBadge");
const userStatusBadge = document.getElementById("userStatusBadge");

const plantsContainer = document.getElementById("plantsContainer");
const activeTradesContainer = document.getElementById("activeTradesContainer");
const completedTradesContainer = document.getElementById("completedTradesContainer");

const token = localStorage.getItem("token");


if (!token) {
  window.location.href = "/login.html";
}

// init
initProfile();

async function initProfile() {
  try {
    const user = await getProfile(token);
    const plants = await getPlants(token);

    console.log("USER:", user);
    console.log("PLANTS:", plants);

    renderProfile(user, plants);
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

// profile 
function renderProfile(user, plants = []) {
  nameEl.textContent = user.name || "Unknown";
  emailEl.textContent = user.email || "";

  const fallbackImage = "public/blank-profile-picture.svg";

  imageEl.src = user.profileImage || fallbackImage;

  imageEl.onerror = () => {
    imageEl.src = fallbackImage;
  };

  aboutEl.textContent = user.about || "No bio yet";
  aboutEl.classList.toggle("empty-state", !user.about);

  const trades = user.trades || [];

  plantCountBadge.textContent = `${plants.length} plants`;

  userStatusBadge.textContent = user.verified
    ? "Verified swapper"
    : "Unverified";

  renderPlants(plants);
  renderActiveTrades(trades);
  renderCompletedTrades(trades);
}

function cleanImage(url) {
  if (!url) return null;


  if (url.includes("imgurl=")) {
    try {
      const match = url.match(/imgurl=([^&]+)/);
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (e) {
      return null;
    }
  }

  if (url.includes("imgres")) return null;

  return url;
}

// plants
  function renderPlants(plants) {
  plantsContainer.innerHTML = "";

  if (!plants.length) {
    plantsContainer.innerHTML = `<p class="empty-state">No plants yet</p>`;
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.classList.add("plant-card");

    card.innerHTML = `
        ${cleanImage(plant.image)
          ? `<img src="${cleanImage(plant.image)}" alt="${plant.name}" />`
          : ""
        }

      <div>
        <strong>${plant.name || "Unnamed plant"}</strong>

        <p>${plant.description || "No description"}</p>

        <p>
          Light requirements: ${plant.lightRequirements ?? "N/A"}
        </p>

        <small>
          ${plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : ""}
        </small>
      </div>
    `;
    
    plantsContainer.appendChild(card);
  });
  
}

//active trades
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
        <strong>${trade.plantName || "Unknown plant"}</strong>
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

  completedTradesContainer.innerHTML = "";

  if (!completed.length) {
    completedTradesContainer.innerHTML =
      `<p class="empty-state">No completed swaps</p>`;
    return;
  }

  completed.forEach((trade) => {
    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <div>
        <strong>${trade.plantName || "Unknown plant"}</strong>
        <p>With ${trade.withUser || "Unknown user"}</p>
      </div>
      <span class="badge">Completed</span>
    `;

    completedTradesContainer.appendChild(card);
  });
}