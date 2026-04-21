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
export async function updateProfile(token, data) {
    const res = await apiFetch(`${getBaseUrl()}/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
    }

    return res.json();
}

// get plants
export async function getPlants() {

    const res = await apiFetch(`${getBaseUrl()}/me/plants`);

    if (!res.ok) {
        throw new Error(`Failed to fetch plants: ${res.status}`);
    }

    return res.json();
}

export async function deleteProduct(id) {
    const res = await apiFetch(`${getBaseUrl()}/products/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error(`Failed to delete product: ${res.status}`);
    }

    return true;
}