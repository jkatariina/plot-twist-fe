import { createPlant } from "../utils/addPlantApi";

const token = localStorage.getItem("token");

const form = document.getElementById("addPlantForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("plant-name").value;
  const location = document.getElementById("plant-location").value;
  const image = document.getElementById("plant-image").value;
  const description = document.getElementById("plant-description").value;

  const plantData = {
    name,
    location,
    image,
    description,
  };

  try {
    const result = await createPlant(token, plantData);

    console.log("Plant created:", result);

    // redirect efter success
    window.location.href = "/profile.html";

  } catch (error) {
    console.error("Error creating plant:", error);
  }
});