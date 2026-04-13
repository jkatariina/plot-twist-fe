import { getProfile, getPlants } from "../utils/profileApi.js";
import { getTrades } from "../utils/tradesApi.js";

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
    const allTrades = await getTrades(token);
    const userId = JSON.parse(atob(token.split(".")[1])).id;

    renderProfile(user, plants, allTrades, userId);
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}


// profile 
function renderProfile(user, plants = [], trades = [], userId) {
  nameEl.textContent = user.name || "Unknown";
  emailEl.textContent = user.email || "";

  const fallbackImage = "public/blank-profile-picture.svg";

  imageEl.src = user.profileImage || fallbackImage;

  imageEl.onerror = () => {
    imageEl.src = fallbackImage;
  };

  aboutEl.textContent = user.about || "No bio yet";
  aboutEl.classList.toggle("empty-state", !user.about);

  plantCountBadge.textContent = `${plants.length} plants`;

  userStatusBadge.textContent = user.verified
    ? "Verified swapper"
    : "Unverified";

  renderPlants(plants);
  renderActiveTrades(trades, userId, plants);
  renderCompletedTrades(trades, userId, plants);
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
function getPlantName(productId, plants) {
  const plant = plants.find(p => p._id === productId);
  return plant ? plant.name : "Unknown plant";
}

function getUserName(userId, users) {
  const user = users.find(u => u._id === userId);
  return user ? user.name : "Unknown user";
}

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
function renderActiveTrades(trades, userId, plants) {
  const active = trades.filter((t) => t.status === "pending");

  activeTradesContainer.innerHTML = "";

  if (!active.length) {
    activeTradesContainer.innerHTML =
      `<p class="empty-state">No active swaps</p>`;
    return;
  }

  active.forEach((trade) => {
    const isOutgoing = trade.requester === userId;
    const otherUser = isOutgoing ? trade.receiver : trade.requester;

console.log("trade:", trade);
console.log("productName:", trade.product);

    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <div>
        <strong>Product: ${getPlantName(trade.product, plants)}</strong>
      <p>${isOutgoing ? "" : ""}</p>
      </div>
      <span class="badge">Pending</span>
    `;

    activeTradesContainer.appendChild(card);
  });
}


// completed trades

function renderCompletedTrades(trades, userId, plants) {
  const completed = trades.filter(
    (t) => t.status === "accepted" || t.status === "rejected"
  );

  completedTradesContainer.innerHTML = "";

  if (!completed.length) {
    completedTradesContainer.innerHTML =
      `<p class="empty-state">No completed swaps</p>`;
    return;
  }

  completed.forEach((trade) => {
    const isOutgoing = trade.requester === userId;
    const otherUser = isOutgoing ? trade.receiver : trade.requester;

    const card = document.createElement("div");
    card.classList.add("activity-card");

    card.innerHTML = `
      <div>
        <strong>Product: ${getPlantName(trade.product, plants)}</strong>
        <p>${isOutgoing ? "To" : "From"} user: ${otherUser}</p>
      </div>
      <span class="badge">${trade.status}</span>
    `;

    completedTradesContainer.appendChild(card);
  });
}