import { login, register } from "../utils/authApi.js";
import { showToast } from "../utils/toastify.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

// --- LOGIN ---
loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showToast("Please fill in both email and password", "error");
        return;
    }

    if (!emailInput.checkValidity()) {
        showToast("Please enter a valid email", "error");
        return;
    }

    loginBtn.disabled = true;

    try {
        const data = await login(email, password);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        showToast("Login successful!", "success");
        setTimeout(() => {
            window.location.href = "/map.html";
        }, 1000);

    } catch (error) {
        showToast(error.message || "Wrong email or password", "error");
    } finally {
        loginBtn.disabled = false;
    }
});


// --- REGISTER ---
const registerFullnameInput = document.getElementById("registerFullnameInput");
const registerEmailInput = document.getElementById("registerEmailInput");
const registerPasswordInput = document.getElementById("registerPasswordInput");
const termsCheckbox = document.getElementById("registerTerms");
const submitBtn = document.getElementById("submitBtn");

submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = registerEmailInput?.value.trim();
    const password = registerPasswordInput?.value.trim();
    const name = registerFullnameInput?.value.trim();
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    const termsAccepted = termsCheckbox?.checked;

    if (!name || !email || !password) {
        showToast("Please fill in all fields", "error");
        return;
    }

    if (!registerEmailInput.checkValidity()) {
        showToast("Please enter a valid email", "error");
        return;
    }

    if (!strongPassword.test(password)) {
        showToast("Password must be 8+ characters and include a number", "error");
        return;
    }

    if (!termsAccepted) {
        showToast("You must accept the terms", "error");
        return;
    }

    submitBtn.disabled = true;

    try {
        await register(name, email, password);

        showToast("Registration successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1500);

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        showToast(error.message || "Something went wrong", "error");
    } finally {
        submitBtn.disabled = false;
    }
});