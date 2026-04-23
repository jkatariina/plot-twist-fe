import { getProfile, updateProfile, getPlants, deleteProduct } from "../utils/profileApi.js";
import { getTrades, updateTradeStatus } from "../utils/tradesApi.js";
import { showToast } from "../utils/toastify.js";

const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const imageEl = document.getElementById("userImage");
const aboutEl = document.getElementById("profileAbout");
const plantCountBadge = document.getElementById("plantCountBadge");
const userStatusBadge = document.getElementById("userStatusBadge");
const editImageBtn = document.getElementById("editImageBtn");
const profileImageInput = document.getElementById("profileImageInput");
const editAboutBtn = document.getElementById("editAboutBtn");

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
    const trades = await getTrades(token);

    const hiddenPlantIds = trades
      .filter(t => t.status === "completed")
      .map(t => t.product?._id);

    const visiblePlants = plants.filter((p) => !hiddenPlantIds.includes(p._id));

    renderProfile(user, visiblePlants);
    renderTrades(trades, user._id);

    hideLoader();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to load profile", "error");
  }
}

initProfile();

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

  userStatusBadge.textContent = user.verified ? "Verified swapper" : "Unverified";

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

      <div class="plant-content">
        <strong>${plant.name || "Unnamed plant"}</strong>
        <p>${plant.description || "No description"}</p>

        <div class="plant-details">
          ${
            cleanImage(plant.image)
              ? `<img class="plant-preview-image" src="${cleanImage(plant.image)}" alt="${plant.name}" />`
              : ""
          }
          <p><strong>Light requirements:</strong> ${plant.lightRequirements}</p>
          <p>
            <strong>Created at:</strong>
            ${plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : ""}
          </p>
        </div>

        <button class="delete-plant-btn">Delete</button>
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

          const currentCount = parseInt(plantCountBadge.textContent) || plants.length;

          plantCountBadge.textContent = `${currentCount - 1} plants`;

          showToast("Plant deleted successfully!", "success");
        } catch (err) {
          console.error(err);
          showToast(err.message || "Failed to delete plant", "error");
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
function renderTrades(trades, currentUserId) {
  activeTradesContainer.innerHTML = "";
  completedTradesContainer.innerHTML = "";

  if (!trades || trades.length === 0) {
    activeTradesContainer.innerHTML = `<p class="empty-state">No active trades</p>`;
    completedTradesContainer.innerHTML = `<p class="empty-state">No completed trades</p>`;
    return;
  }

  const activeTrades = trades.filter((t) => t.status === "pending");

  const completedTrades = trades.filter((t) => t.status === "accepted" || t.status === "rejected");

  localStorage.setItem("seenFinishedTrades", completedTrades.length);

  renderTradeList(activeTrades, activeTradesContainer, "No active trades", currentUserId);
  renderTradeList(completedTrades, completedTradesContainer, "No completed trades", currentUserId);
}

function renderTradeList(trades, container, emptyText, currentUserId) {
  container.innerHTML = "";

  if (!trades.length) {
    container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  trades.forEach((trade) => {
    const requesterId = String(trade.requester?._id || trade.requester || "");
    const viewerId = String(currentUserId || "");
    const isRequester = requesterId && viewerId && requesterId === viewerId;

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

      <button type="button" class="trade-info-btn">More info</button>

      <div class="trade-details">
        <img class="trade-image" src="${trade.product?.image}" alt="plant image"/>
        <p>
          <strong>${trade.product?.name || "Unknown"}</strong> <br/>
          ${trade.product?.description || "Unknown"}<br/>
          <strong>Light requirements: </strong>${trade.product?.lightRequirements || ""}
        </p>
      </div>

      ${
        trade.status === "pending"
          ? `
          ${!isRequester ? `
            <div class="meeting-setup">
              <label for="time-${trade._id}">Meeting time:</label>
              <input type="datetime-local" id="time-${trade._id}" class="meeting-time-input" />
            </div>
          ` : ""}
          
          <div class="trade-actions">
            ${!isRequester ? `<button type="button" class="accept-trade-btn">Accept</button>` : ""}
            <button type="button" class="reject-trade-btn">
              ${isRequester ? "Cancel" : "Reject"}
            </button>
          </div>
        `
          : ""
      }

    </div>
  `;

  const content = card.querySelector(".trade-content");
  const infoBtn = card.querySelector(".trade-info-btn");

  function toggleTradeDetails(e) {
    e.stopPropagation();
    card.classList.toggle("open");
  }

  content.addEventListener("click", toggleTradeDetails);
  infoBtn.addEventListener("click", toggleTradeDetails);

    if (trade.status === "pending") {
      const acceptBtn = card.querySelector(".accept-trade-btn");
      const rejectBtn = card.querySelector(".reject-trade-btn");

acceptBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        
        let extraData = {};
        
        if (!isRequester) {
            const timeInput = card.querySelector(`#time-${trade._id}`);
            const meetingTime = timeInput?.value;
            
            if (!meetingTime) {
                showToast("Please select a meeting time!", "error");
                return;
            }
            
            const meetingPlace = trade.product?.coordinates;
            
            extraData = { 
                // Omvandlar datumet till exakt det format Mongoose älskar!
                meetingTime: new Date(meetingTime).toISOString(), 
                meetingPlace: meetingPlace 
            };
        }

        // Titta i din konsol när du klickar! Är allt med?
        console.log("Detta skickas till backend:", { status: "accepted", ...extraData });

        handleTradeStatusUpdate(trade._id, "accepted", extraData);
      });

      rejectBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        handleTradeStatusUpdate(trade._id, "rejected");
      });
    }

  container.appendChild(card);
});

}

// UPPDATERAD FUNKTION! Tar nu emot extraData
async function handleTradeStatusUpdate(tradeId, status, extraData = {}) {
  try {
    await updateTradeStatus(tradeId, status, extraData);
    await initProfile();

    showToast(`Trade ${status} successfully!`, "success");
  } catch (err) {
    showToast(err.message || "Failed to update trade", "error");
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
    showToast("Name updated successfully!", "success");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to update name", "error");
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
      about: input.value,
    });

    aboutEl.textContent = res.about || "No bio yet";
    aboutEl.classList.toggle("empty-state", !res.about);

    showToast("Bio updated successfully!", "success");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to update bio", "error");
  }

  editAboutBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
  isEditingAbout = false;
});

//edit profile image
editImageBtn?.addEventListener("click", () => {
  profileImageInput?.click();
});

profileImageInput?.addEventListener("change", async () => {
  const selectedFile = profileImageInput.files?.[0];

  if (!selectedFile) {
    return;
  }

  const profileData = new FormData();
  profileData.append("profileImage", selectedFile);

  if (editImageBtn) {
    editImageBtn.disabled = true;
  }

  try {
    const updatedUser = await updateProfile(token, profileData);
    const nextImage = updatedUser?.profileImage || updatedUser?.user?.profileImage;

    if (nextImage) {
      imageEl.src = nextImage;
    }

    showToast("Profile image updated!", "success");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to upload image", "error");
  } finally {
    if (profileImageInput) {
      profileImageInput.value = "";
    }

    if (editImageBtn) {
      editImageBtn.disabled = false;
    }
  }
});