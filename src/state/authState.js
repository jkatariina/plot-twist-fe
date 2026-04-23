export function getToken() {
    return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

export function isLoggedIn() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login.html";
}

export function getMyUserId() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
        // Ett magiskt Vanilla JS-trick för att läsa inuti en JWT-token!
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Returnera ID:t (Kolla din backend om du döpt det till "id" eller "_id" i token-payloaden)
        return payload.id; 
    } catch (e) {
        return null;
    }
}