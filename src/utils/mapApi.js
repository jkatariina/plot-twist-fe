import { getBaseUrl } from "../utils/api.js";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";

export async function getPlants() {
    const url = new URL("products", getBaseUrl());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

export async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) {
        throw new Error("Address not found");
    }

    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
    };
}

// OpenFreeMap "positron" vector style (same light look as the old CARTO light_all, no API key)
// leaflet/maplibre-gl are resolved through the import map in map.html and add-plant.html
// attribution is read from the style by maplibre-gl-leaflet
export function addBaseLayer(map) {
    return maplibreGL({
        style: "https://tiles.openfreemap.org/styles/positron",
    }).addTo(map);
}
