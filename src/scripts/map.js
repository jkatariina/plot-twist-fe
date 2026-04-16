import { getPlants } from "../utils/mapApi.js";

const map = L.map("map").setView([59.3293, 18.0686], 12);

// tile layer
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap & CartoDB",
}).addTo(map);


// plant icon
const plantIcon = L.icon({
    iconUrl: "public/plant.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});


// state
let markers = [];
let allPlants = [];
let userLocation = null;
let hasCenteredOnce = false;
let showNearbyOnly = false;

const distanceToggle = document.getElementById("distanceToggle");


// render plants
function renderPlants(plants) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    plants.forEach(plant => {
        const lat = Number(plant.coordinates?.lat);
        const lng = Number(plant.coordinates?.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const marker = L.marker([lat, lng], { icon: plantIcon })
            .addTo(map)
            .bindPopup(`
            <div class="popup-content">
                <img src="${plant.image}" style="width:150px; height:auto;"/> <b>${plant.name}</b>
                ${plant.description || ""}
                <button onclick="sendSwapRequest('${plant._id}')" class="swap-button">Send swap request</button>
            </div>
            `);

        markers.push(marker);
    });
}


// load plants
async function loadPlants() {
    try {
        allPlants = await getPlants();
        renderPlants(allPlants);
    } catch (err) {
        console.error("Failed to load plants:", err);
    }
}

loadPlants();


//set timeout
async function syncPlants() {
    try {
        const plants = await getPlants();
        allPlants = plants;
        renderPlants(plants);
    if (showNearbyOnly){
        filterPlantsByDistance();
    }

    } catch (err) {
        console.error("Sync failed:", err);
    } finally {
        setTimeout(syncPlants, 5000);
    }
}

syncPlants();


// user location
map.locate({
    setView: false,
    enableHighAccuracy: true
});

map.on("locationfound", (e) => {

    userLocation = e.latlng;

    const radius = 10000;

    const bounds = L.latLng(userLocation).toBounds(radius);

    if (!hasCenteredOnce) {
        setTimeout(() => {
            map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 13
            });
        }, 0);

        hasCenteredOnce = true;
    }

    // user marker
    L.circleMarker(userLocation, {
        radius: 10,
        color: "#2c2c2c",
        fillColor: "#4d4d4d",
        fillOpacity: 1
    })
    .addTo(map)
    .bindPopup("You are here 📍");

    if (showNearbyOnly) {
        filterPlantsByDistance();
    }
    
});

map.on("locationerror", (err) => {
    console.error("LOCATION ERROR:", err.message);
});

distanceToggle?.addEventListener("change", (event) => {
    showNearbyOnly = event.target.checked;

    if (showNearbyOnly) {
        filterPlantsByDistance();
        return;
    }

    renderPlants(allPlants);
});


// filter plants by distance
function filterPlantsByDistance() {
    if (!userLocation) return;

    const radius = 10000;

    const nearbyPlants = allPlants.filter(plant => {
        const lat = Number(plant.coordinates?.lat);
        const lng = Number(plant.coordinates?.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

        return userLocation.distanceTo([lat, lng]) <= radius;
    });

    renderPlants(nearbyPlants);
}
