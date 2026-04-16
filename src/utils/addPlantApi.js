import { getBaseUrl } from "../utils/api.js";

export async function createPlant(token, plantData) {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plantData),
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to create plant");
  }

  return data;
}