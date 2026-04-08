import { login } from "../utils/authApi.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

let errorMessage = document.getElementById("errorMessage");

if (!errorMessage) {
    errorMessage = document.createElement("p");
    errorMessage.id = "errorMessage";
    errorMessage.classList.add("error-message");
    errorMessage.style.display = "none";

    loginBtn && loginBtn.insertAdjacentElement("afterend", errorMessage);
}

function setErrorMessage(message) {
    if (!message) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return;
    }

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        setErrorMessage("Please fill in both email and password");
        return;
    }

    loginBtn.disabled = true;

    try {
        const data = await login(email, password);

        console.log("LOGIN RESPONSE:", data);

        if (data?.error || data?.message) {
            setErrorMessage("Wrong email or password");
            return;
        }

        if (!data?.token) {
            setErrorMessage("Wrong email or password");
            return;
        }

        localStorage.setItem("token", data.token);

        setErrorMessage("");
        window.location.href = "/map.html";

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        setErrorMessage("Wrong email or password");
    } finally {
        loginBtn.disabled = false;
    }
});