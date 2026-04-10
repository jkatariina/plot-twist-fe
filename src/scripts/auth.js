import { login, register } from "../utils/authApi.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

let errorMessage = document.getElementById("errorMessage");

if (!errorMessage) {
    errorMessage = document.createElement("p");
    errorMessage.id = "errorMessage";
    errorMessage.classList.add("error-message");
    errorMessage.style.display = "none";

    passwordInput && passwordInput.insertAdjacentElement("afterend", errorMessage);
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

    const name = registerFullnameInput?.value.trim();
    const email = registerEmailInput?.value.trim();
    const password = registerPasswordInput?.value.trim();
    const termsAccepted = termsCheckbox?.checked;

    console.log({ name, email, password, termsAccepted });

    if (!name || !email || !password) {
        showError(errorMessageRegister, "Please fill in all fields");
        return;
    }

    if (!termsAccepted) {
        showError(errorMessageRegister, "You must accept the terms");
        return;
    }

    submitBtn.disabled = true;

    try {
        const data = await register(name, email, password);

        if (data?.errors) {
            const msg = data.errors.map(e => e.msg).join(", ");
            showError(errorMessageRegister, msg);
            return;
        }

        if (data?.error || !data) {
            showError(errorMessageRegister, data?.message || "Email already exist");
            return;
        }

        if (data?.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "/map.html";
            return;
        }

        window.location.href = "/login.html";

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        showError(errorMessageRegister, error.message || "Something went wrong");
    } finally {
        submitBtn.disabled = false;
    }
});