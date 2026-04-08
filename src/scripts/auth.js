import { login } from "../utils/authApi.js";
import { setToken, isLoggedIn } from "../state/authState.js";

if (isLoggedIn()) {
    window.location.href = "/map.html";
}

const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const loginBtn = document.querySelector("#loginBtn");

let error = document.querySelector("#errorMessage");

if (!error) {
    error = document.createElement("p");
    error.id = "errorMessage";
    error.classList.add("error-message");
    loginBtn.insertAdjacentElement("afterend", error);
}

function setError(msg) {
    error.textContent = msg || "";
}

loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        setError("Fill in all fields");
        return;
    }

    try {
        const data = await login(email, password);

        setToken(data.token);

        window.location.href = "/map.html";

    } catch (err) {
        setError(err.message);
    }
});