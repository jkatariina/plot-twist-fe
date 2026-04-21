import { getProfile, updateProfile, getPlants, deleteProduct } from "../utils/profileApi.js";
import { getTrades, updateTradeStatus } from "../utils/tradesApi.js";

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const imageEl = document.getElementById("userImage");
const aboutEl = document.getElementById("profileAbout");
const plantCountBadge = document.getElementById("plantCountBadge");
const userStatusBadge = document.getElementById("userStatusBadge");

const plantsContainer = document.getElementById("plantsContainer");
const activeTradesContainer = document.getElementById("activeTradesContainer");
const completedTradesContainer = document.getElementById("completedTradesContainer");

const token = localStorage.getItem("accessToken");

const loader = document.getElementById("pageLoader");


if (!token) {
  window.location.href = "/login.html";
}


// init profile
async function initProfile() {
  try {
    const user = await getProfile(token);
    const plants = await getPlants(token);
    const trades = await loadUserTrades();

    renderProfile(user, plants);
    renderTrades(trades);

    hideLoader();

  } catch (err) {
    console.error("Failed to load profile:", err);

    hideLoader();
  }
}

initProfile();

async function loadUserTrades() {
  const trades = await getTrades();
  console.log("Trades for logged in user:", trades);
  return trades;
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

// active plant listings
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
      ${
        cleanImage(plant.image)
          ? `<img class="plant-image" src="${cleanImage(plant.image)}" alt="${plant.name}" />`
          : ""
      }

      <button class="delete-plant-btn">X</button>

      <div class="plant-content">
        <strong>${plant.name || "Unnamed plant"}</strong>
        <p>${plant.description || "No description"}</p>

        <div class="plant-details">
          <p><strong>Light requirements:</strong> ${plant.lightRequirements}</p>
          <p>
            <strong>Created at:</strong>
            ${plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
      </div>
    `;

//  delete plant
    const deleteBtn = card.querySelector(".delete-plant-btn");

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        const confirmed = confirm("Are you sure you want to delete this plant?");
        if (!confirmed) return;

        try {
          await deleteProduct(plant._id);

          card.remove();

          const currentCount =
            parseInt(plantCountBadge.textContent) || plants.length;

          plantCountBadge.textContent = `${currentCount - 1} plants`;

        } catch (err) {
          console.error("Delete failed:", err);
        }
      });
    }

    // toggle card
    card.addEventListener("click", () => {
      card.classList.toggle("open");
    });

    plantsContainer.appendChild(card);
  });
}

// helpers
function formatStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return status;
}

function getStatusClass(status) {
  if (status === "pending") return "badge-pending";
  if (status === "accepted") return "badge-accepted";
  if (status === "approved") return "badge-accepted";
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
    t => t.status === "accepted" || t.status === "approved" || t.status === "rejected"
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
    <div class="trade-content">

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

      <div class="trade-details">
        <img class="trade-image" src="${trade.product?.image}" alt="plant image"/>
        <p>
          <strong>${trade.product?.name || "Unknown"}</strong> <br/>
          ${trade.product?.description || "Unknown"}<br/>
          <strong>Light requirements: </strong>${trade.product?.lightRequirements || ""}
        </p>

        ${trade.status === "pending"
          ? `
            <div class="trade-actions">
              <button type="button" class="accept-trade-btn">Accept</button>
              <button type="button" class="reject-trade-btn">Reject</button>
            </div>
          `
          : ""
        }
      </div>
    `;

    if (trade.status === "pending") {
      const acceptBtn = card.querySelector(".accept-trade-btn");
      const rejectBtn = card.querySelector(".reject-trade-btn");

      acceptBtn.addEventListener("click", () => handleTradeStatusUpdate(trade._id, "approved"));
      rejectBtn.addEventListener("click", () => handleTradeStatusUpdate(trade._id, "rejected"));
    }

  container.appendChild(card);
});
}

async function handleTradeStatusUpdate(tradeId, status) {
  try {
    await updateTradeStatus(tradeId, status);
    const trades = await loadUserTrades();
    renderTrades(trades);
  } catch (err) {
    console.error("Failed to update trade status:", err);
  }
}


function hideLoader() {
  if (!loader) return;

  loader.classList.add("hide");

  setTimeout(() => {
    loader.remove();
  }, 500);
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
