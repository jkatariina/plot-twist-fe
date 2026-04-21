import { apiFetch, getBaseUrl } from "../utils/api.js";

export async function getTrades() {

    const res = await apiFetch(`${getBaseUrl()}/me/trades`);

    if (!res.ok) {
        throw new Error(`Failed to fetch trades: ${res.status}`);
    }

    const content = await res.json();

    const result = content.map(async (item) => {
        const trade = await apiFetch(`${getBaseUrl()}/trades/${item._id}`);

        return trade.json();
    });

    return await Promise.all(result);
}

export async function updateTradeStatus(tradeId, status) {
    throw new Error("Trade update endpoint not implemented yet");
}
