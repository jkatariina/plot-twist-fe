import { isLoggedIn, logout } from "../state/authState.js";

const loginItem = document.getElementById("loginItem");
const logoutItem = document.getElementById("logoutItem");
const logoutBtn = document.getElementById("logoutBtn");

function updateAuthUI() {
    if (isLoggedIn()) {
        loginItem.style.display = "none";
        logoutItem.style.display = "block";
    } else {
        loginItem.style.display = "block";
        logoutItem.style.display = "none";
    }
}

logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    window.location.href = "index.html"; 
});

updateAuthUI();