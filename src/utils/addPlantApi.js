import { getBaseUrl } from "../utils/api.js";

export async function createPlant(token, plantData) {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: plantData,
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  let data;
  if (contentType.includes("application/json")) {
    data = JSON.parse(text);
  } else {
    data = { message: text };
  }

  if (!response.ok) {
    const isHtml = typeof data.message === "string" && data.message.includes("<html");
    throw new Error(isHtml ? `Server error (${response.status})` : data.message || "Failed to create plant");
  }

  return data;
}
