import { isLoggedIn, logout } from "../state/authState.js";

const authLink = document.querySelector("#authLink");

function updateAuthUI() {
    if (!authLink) return;

    // reset handler
    authLink.onclick = null;

    if (isLoggedIn()) {
        authLink.textContent = "Logout";
        authLink.href = "#";

        authLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };

    } else {
        authLink.textContent = "Log in";
        authLink.href = "/login.html";
        authLink.onclick = null;
    }
}

updateAuthUI();