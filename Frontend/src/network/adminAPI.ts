import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import { fetchData } from "./fetcher"

export async function getLoggedInAdmin(): Promise<Admin> {
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/admin", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });

    if (!response.ok) {
        // Check for authorization failure (e.g., status code 401 or 403)
        if (response.status === 401 || response.status === 403) {
            console.error("Authorization failed. Logging out user.");
            await logout();
        }

        // Handle other errors if needed
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
}

export async function adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        // Check for authorization failure (e.g., status code 401 or 403)
        if (response.status === 401 || response.status === 403) {
            console.error("Authorization failed. Logging out user.");
            await logout();
        }

        // Handle other errors if needed
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
}

interface LoginResponse {
    admin: Admin;
    token: string;
}

export async function logout() {
    await fetchData("https://mrtonlineapi.onrender.com/api/admin/logout", {
        method: "POST"
    });
}