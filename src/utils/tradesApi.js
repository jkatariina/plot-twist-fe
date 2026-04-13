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

    const content = await res.json();

    const result = content.map(async (item) => {
        const trade = await fetch(`${getBaseUrl()}/trades/${item._id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return trade.json();
    });

    return await Promise.all(result);
}