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

export async function createTrade(productId) {
    const res = await apiFetch(`${getBaseUrl()}/trades`, {
        method: "POST",
        body: JSON.stringify({ productId }),
    });

    if (!res.ok) {
        throw new Error(await getErrorMessage(res));
    }

    return res.json();
}

async function getErrorMessage(res) {
    const errorText = await res.text();

    if (!errorText) {
        return `Failed to create trade: ${res.status}`;
    }

    try {
        const error = JSON.parse(errorText);
        return error.message || JSON.stringify(error);
    } catch (err) {
        return errorText;
    }
}

export async function updateTradeStatus(tradeId, status) {
    const res = await apiFetch(`${getBaseUrl()}/trades/${tradeId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        throw new Error(`Failed to update trade status: ${res.status}`);
    }

    return res.json();
}
