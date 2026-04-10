import { isLoggedIn, logout } from "../state/authState.js";

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

logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    window.location.href = "index.html"; 
});

updateAuthUI();