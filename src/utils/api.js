
export function getBaseUrl() {
  // if (window.location.hostname.includes("localhost")) {
  return "http://localhost:3000/";
  // }
  
  // return "https://webbshop-2026-be-sigma.vercel.app";
}

export async function apiFetch(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    // Skapa headers och lägg till token om den finns
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Gör det ursprungliga anropet
    let response = await fetch(url, { ...options, headers });

    // Om token har gått ut
    if (response.status === 401) {
        const errorData = await response.json();
        
        if (errorData.message === "token_expired") {
            console.log("Token expired, attempting to refresh...");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                // Ingen refresh token finns, tvingar utloggning
                forceLogout();
                return response;
            }

            // Hämta en ny access token från din backend från /auth/refresh
            const refreshUrl = new URL("api/auth/refresh", getBaseUrl());
            const refreshRes = await fetch(refreshUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                
                // Spara den nya tokenen
                localStorage.setItem("accessToken", data.accessToken);
                headers["Authorization"] = `Bearer ${data.accessToken}`;

                // GÖR OM det ursprungliga anropet med nya nyckeln
                response = await fetch(url, { ...options, headers });
            } else {
                forceLogout();
            }
        } 
    }
    return response;
}

export function forceLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login.html"; // Skicka till inloggningssidan
}
