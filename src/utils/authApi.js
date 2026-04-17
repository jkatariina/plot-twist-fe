import { apiFetch, getBaseUrl } from "../utils/api.js";

export async function login(email, password) {
    const url = new URL("auth/login", getBaseUrl());

    const response = await apiFetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function register(name, email, password) {
    const url = new URL("auth/register", getBaseUrl());

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage =
            data?.message ||
            data?.errors?.map(e => e.msg).join(", ") ||
            "Email already exist";

        throw new Error(errorMessage);
    }

    return data;
}