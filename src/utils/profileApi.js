import { getBaseUrl } from "../utils/api.js";

export async function getProfile(token) {
    if (!token) {
        throw new Error("No token provided");
    }

    const res = await fetch(`${getBaseUrl()}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    return res.json();
}

/* ---------------- PLANTS ---------------- */

export async function getPlants(token) {
    if (!token) {
        throw new Error("No token provided");
    }

    const res = await fetch(`${getBaseUrl()}/me/plants`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch plants: ${res.status}`);
    }

    return res.json();
}