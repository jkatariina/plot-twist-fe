import { getMyUserId, isLoggedIn, logout } from "../state/authState.js";
import { getTrades } from "../utils/tradesApi.js";

const loginItem = document.getElementById("loginItem");
const logoutItem = document.getElementById("logoutItem");
const logoutBtn = document.getElementById("logoutBtn");
const profileItem = document.getElementById("profileItem");

// const accountItem = document.getElementById("accountItem")

function updateAuthUI() {
    if (isLoggedIn()) {
        loginItem.style.display = "none";
        // accountItem.style.display = "none";
        logoutItem.style.display = "block";
        profileItem.style.display = "block";
    } else {
        loginItem.style.display = "block";
        // accountItem.style.display = "block";
        logoutItem.style.display = "none";
        profileItem.style.display = "none";
    }
}

async function updateProfileBadge() {
    if (!isLoggedIn()) return;

    try {
        const myUserId = getMyUserId()

        const trades = await getTrades();

        const pendingCount = trades.filter(t => {
            const receiverId = t.receiver._id || t.receiver; 
            
            return t.status === "pending" && receiverId === myUserId;
        }).length;

        const finishedTrades = trades.filter(t => t.status === "accepted" || t.status === "rejected");

        const seenFinishedCount = parseInt(localStorage.getItem("seenFinishedTrades") || "0");

        let newFinishedCount = finishedTrades.length - seenFinishedCount;
        
        if (newFinishedCount < 0) newFinishedCount = 0; 

        // Totala antalet notiser (Alla pending + Nya avslutade)
        const totalNotifications = pendingCount + newFinishedCount;

        const profileLink = document.querySelector('a[href="/profile.html"]');
        
        if (profileLink) {
            let badge = profileLink.querySelector(".notification-badge");

            if (totalNotifications > 0) {
                // Lägg till brickan
                profileLink.classList.add("nav-profile-link");
                
                if (!badge) {
                    badge = document.createElement("span");
                    badge.classList.add("notification-badge");
                    profileLink.appendChild(badge);
                }
                badge.textContent = totalNotifications;
            } else {
                // Om totalNotifications är 0, ta bort notisen helt (så den försvinner när du läst allt)
                if (badge) badge.remove();
            }
        }
    } catch (error) {
        console.error("Kunde inte hämta notiser till navbaren:", error);
    }
}

updateProfileBadge();

logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    window.location.href = "index.html"; 
});

updateAuthUI();