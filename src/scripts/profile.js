import { getProfile, updateProfile, getPlants } from "../utils/profileApi.js";
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

// init profile
initProfile();

async function initProfile() {
  try {
    const user = await getProfile(token);
    const plants = await getPlants(token);
    const trades = await getTrades(token);

    renderProfile(user, plants);
    renderTrades(trades);
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}


// render profile 
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

  plantCountBadge.textContent = `${plants.length} plants`;

  userStatusBadge.textContent = user.verified
    ? "Verified swapper"
    : "Unverified";

  renderPlants(plants);
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

// helpers
function formatStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  return status;
}

function getStatusClass(status) {
  if (status === "pending") return "badge-pending";
  if (status === "accepted") return "badge-accepted";
  if (status === "rejected") return "badge-rejected";
  return "";
}


//active & completed trades 
function renderTrades(trades) {

  activeTradesContainer.innerHTML = "";
  completedTradesContainer.innerHTML = "";

  if (!trades || trades.length === 0) {
    activeTradesContainer.innerHTML = `<p class="empty-state">No active trades</p>`;
    completedTradesContainer.innerHTML = `<p class="empty-state">No completed trades</p>`;
    return;
  }

  const activeTrades = trades.filter(t => t.status === "pending");

  const completedTrades = trades.filter(
    t => t.status === "accepted" || t.status === "rejected"
  );

  renderTradeList(activeTrades, activeTradesContainer, "No active trades");
  renderTradeList(completedTrades, completedTradesContainer, "No completed trades");
}


function renderTradeList(trades, container, emptyText) {
  container.innerHTML = "";

  if (!trades.length) {
    container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  trades.forEach(trade => {
    const card = document.createElement("div");
    card.classList.add("trade-card");

    card.innerHTML = `
      <div>

        <small>
          ${trade.createdAt ? new Date(trade.createdAt).toLocaleDateString() : ""}
        </small>

        <span class="badge ${getStatusClass(trade.status)}">
          ${formatStatus(trade.status)}
        </span>

        <p>
          <strong>From:</strong> ${trade.requester?.name || "Unknown"}<br/>
          <strong>To:</strong> ${trade.receiver?.name || "Unknown"}
        </p>

        <p>
          <strong>Plant:</strong> ${trade.product?.name || "Unknown"}
        </p>
      </div>
    `;

    container.appendChild(card);
  });
}


//edit name
let isEditingName = false;
const editNameBtn = document.getElementById("editNameBtn");

function startNameEdit() {
  if (isEditingName) return;

  const currentName = nameEl.textContent;

  nameEl.innerHTML = `
    <input id="nameInput" class="name-input" value="${currentName}" />
  `;

  document.getElementById("nameInput").focus();

  isEditingName = true;
  editNameBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
}

async function saveName() {
  const input = document.getElementById("nameInput");
  if (!input) return;

  const newName = input.value.trim();

  try {
    const res = await updateProfile(token, { name: newName });
    nameEl.textContent = res.name || "Unknown";
  } catch (err) {
    console.error(err);
  }

  isEditingName = false;
  editNameBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
}

nameEl.addEventListener("click", startNameEdit);
editNameBtn.addEventListener("click", () => {
  if (isEditingName) {
    saveName();
  } else {
    startNameEdit();
  }
});

document.addEventListener("keydown", async (e) => {
  const input = document.getElementById("nameInput");
  if (!input || !isEditingName) return;

  if (e.key === "Enter") {
    await saveName();
  }

  if (e.key === "Escape") {
    nameEl.textContent = nameEl.textContent;
    isEditingName = false;
    editNameBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
  }
});


//edit about 
let isEditingAbout = false;

editAboutBtn.addEventListener("click", async () => {
  if (!isEditingAbout) {
    const currentText = aboutEl.textContent;

    aboutEl.innerHTML = `
      <textarea id="aboutInput" class="about-input">${currentText}</textarea>
    `;

    document.getElementById("aboutInput").focus();

    editAboutBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    isEditingAbout = true;
    return;
  }

  const input = document.getElementById("aboutInput");

  try {
    const res = await updateProfile(token, {
      about: input.value
    });

    aboutEl.textContent = res.about || "No bio yet";
    aboutEl.classList.toggle("empty-state", !res.about);

  } catch (err) {
    console.error(err);
  }

  editAboutBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
  isEditingAbout = false;
});


//edit profile image

