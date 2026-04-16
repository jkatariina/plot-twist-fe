import { getBaseUrl } from "../utils/api.js";

//profile
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

//update profile
export async function updateProfile(token, data) {
    if (!token) {
        throw new Error("No token provided");
    }

    const res = await fetch(`${getBaseUrl()}/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
    }

    return res.json();
}

//plants
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