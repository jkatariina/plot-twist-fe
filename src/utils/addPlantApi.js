import { getBaseUrl } from "./api.js";

export async function createPlant(token, plantData) {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/plants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plantData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create plant");
  }

  return data;
}