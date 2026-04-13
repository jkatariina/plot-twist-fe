import { getBaseUrl } from "../utils/api.js";

export async function getTrades(token) {
    if (!token) {
        throw new Error("No token provided");
    }

    const res = await fetch(`${getBaseUrl()}/me/trades`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch trades: ${res.status}`);
    }

    return res.json();
}