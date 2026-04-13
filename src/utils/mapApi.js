import { getBaseUrl } from "../utils/api.js";

export async function getPlants() {
    const url = new URL("products", getBaseUrl());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}
