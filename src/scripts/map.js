import { getPlants } from "../utils/mapApi.js";

// map init
const map = L.map("map").setView([59.3293, 18.0686], 12);

// tile layer
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap & CartoDB",
}).addTo(map);

// icon
const plantIcon = L.icon({
    iconUrl: "public/plant.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

// state
let allPlants = [];
let markers = [];
let userMarker = null;

//sidebar
function renderSidebar(plants) {
    const container = document.getElementById("plantList");

    container.innerHTML = plants.map(plant => `
        <div class="plant-item" data-id="${plant._id}">
            <img src="${plant.image}" />
            <h3><strong>${plant.name}</strong></h3>
            <p><strong>Light requirements: </strong>${plant.lightRequirements || ""}</p>
            <p>${plant.description || ""}</p>
        </div>
    `).join("");

    container.querySelectorAll(".plant-item").forEach(el => {
        el.addEventListener("click", () => {
            const plant = allPlants.find(p => p._id === el.dataset.id);
            if (!plant) return;

            openPlantPopup(plant);

            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });
}

// markers
function renderMarkers(plants) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    plants.forEach(plant => {
        const lat = Number(plant.coordinates?.lat);
        const lng = Number(plant.coordinates?.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const marker = L.marker([lat, lng], { icon: plantIcon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-content">
                    <img src="${plant.image}" />
                    <b>${plant.name}</b>
                    <p><strong>Light requirements: </strong>${plant.lightRequirements || ""}</p>    
                    <p>${plant.description || ""}</p>
                    <button class="swap-button">
                        Send trade request
                    </button>
                </div>
            `);

        markers.push(marker);
    });
}

// plant popup
function openPlantPopup(plant) {
    const lat = Number(plant.coordinates?.lat);
    const lng = Number(plant.coordinates?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.setView([lat, lng], window.innerWidth <= 768 ? 13 : 14);

    const marker = markers.find(m => {
        const pos = m.getLatLng();
        return pos.lat === lat && pos.lng === lng;
    });

    if (marker) {
        setTimeout(() => marker.openPopup(), 200);
    }
}

//load plants
async function loadPlants() {
    try {
        allPlants = await getPlants();
        renderSidebar(allPlants);
        renderMarkers(allPlants);
    } catch (err) {
        console.error(err);
    }
}

loadPlants();

// sync plants 
async function syncPlants() {
    try {
        const plants = await getPlants();
        allPlants = plants;

        renderSidebar(plants);
        renderMarkers(plants);

    } catch (err) {
        console.error(err);
    }

    setTimeout(syncPlants, 20000);
}

syncPlants();

// find location 

map.locate({
    setView: false,
    enableHighAccuracy: true
});

map.on("locationfound", (e) => {
    const userLocation = e.latlng;

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.circleMarker(userLocation, {
        radius: 10,
        color: "#2c2c2c",
        fillColor: "#4d4d4d",
        fillOpacity: 1
    })
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

});

map.on("locationerror", (err) => {
    console.warn("Location denied:", err.message);

    alert("We couldn't access your location. Nearby features will not work.");
});