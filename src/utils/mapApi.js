import { getBaseUrl } from "./api.js";

export async function getPlants() {
    const url = new URL("products", getBaseUrl());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

export async function createPlant(plant) {
    const url = new URL("products", getBaseUrl());

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(plant),
    });

    if (!response.ok) {
        throw new Error("Failed to create product");
    }

    return response.json();
}