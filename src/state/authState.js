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