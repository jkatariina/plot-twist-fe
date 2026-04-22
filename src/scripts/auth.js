import { login, register } from "../utils/authApi.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

let errorMessage = document.getElementById("errorMessage");

//login

if (!errorMessage) {
    errorMessage = document.createElement("p");
    errorMessage.id = "errorMessage";
    errorMessage.classList.add("error-message");
    errorMessage.style.display = "none";

    loginBtn && loginBtn.insertAdjacentElement("afterEnd", errorMessage);
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

    if (!emailInput.checkValidity()) {
        setErrorMessage("Please enter a valid email");
        return;
    }

    loginBtn.disabled = true;

    try {
        const data = await login(email, password);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        window.location.href = "/map.html";

    } catch (error) {
        setErrorMessage(error.message || "Login failed");
    } finally {
        loginBtn.disabled = false;
    }
});

//register

const registerFullnameInput = document.getElementById("registerFullnameInput");
const registerEmailInput = document.getElementById("registerEmailInput");
const registerPasswordInput = document.getElementById("registerPasswordInput");
const termsCheckbox = document.getElementById("registerTerms");
const submitBtn = document.getElementById("submitBtn");

let errorMessageRegister = document.getElementById("errorMessageRegister");

if (!errorMessageRegister) {
    errorMessageRegister = document.createElement("p");
    errorMessageRegister.id = "errorMessageRegister";
    errorMessageRegister.classList.add("errorMessageRegister");
    errorMessageRegister.style.display = "none";
    submitBtn?.insertAdjacentElement("beforebegin", errorMessageRegister);
}

function showError(element, message) {
    if (!element) return;

    if (!message) {
        element.textContent = "";
        element.style.display = "none";
        return;
    }

    element.textContent = message;
    element.style.display = "block";
}

submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    showError(errorMessageRegister, "");

    const email = registerEmailInput?.value.trim();
    const password = registerPasswordInput?.value.trim();
    const name = registerFullnameInput?.value.trim();
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    const termsAccepted = termsCheckbox?.checked;

    if (!name || !email || !password) {
        showError(errorMessageRegister, "Please fill in all fields");
        return;
    }

    if (!registerEmailInput.checkValidity()) {
        showError(errorMessageRegister, "Please enter a valid email");
        return;
    }

    if (!strongPassword.test(password)) {
        showError(
            errorMessageRegister,
            "Password must be 8+ characters and include a number"
        );
        return;
    }

    if (!termsAccepted) {
        showError(errorMessageRegister, "You must accept the terms");
        return;
    }

    submitBtn.disabled = true;


const successNotification = document.getElementById("successNotification");

if (!successNotification) {
    console.warn("Success notification element not found");
}

    try {
        await register(name, email, password);

        alert("Registration successful!");

        window.location.href = "/login.html";

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        showError(errorMessageRegister, error.message || "Something went wrong");
    }

    submitBtn.disabled = false;
    }
);