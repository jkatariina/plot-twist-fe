import { apiFetch, getBaseUrl } from "../utils/api.js";

//profile
export async function getProfile() {

    const res = await apiFetch(`${getBaseUrl()}/me`);

    if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    return res.json();
}

//update profile
export async function updateProfile(data) {

    const res = await apiFetch(`${getBaseUrl()}/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
    }

    return res.json();
}

//plants
export async function getPlants() {

    const res = await apiFetch(`${getBaseUrl()}/me/plants`);

    if (!res.ok) {
        throw new Error(`Failed to fetch plants: ${res.status}`);
    }

    return res.json();
}