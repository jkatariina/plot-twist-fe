import { getBaseUrl } from "./api.js";

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
        return {
            error: data.message || "Wrong email or password"
        };
    }

    return data;
}