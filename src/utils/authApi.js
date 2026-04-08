import { getBaseUrl } from "../utils/api.js";

export async function login(email, password) {
    const url = new URL("auth/login", getBaseUrl());

    const response = await fetch(url, {
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