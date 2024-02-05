import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel";
import { fetchData } from "./fetcher";

const MRT_API = process.env.REACT_APP_API_URL;

export async function getLoggedInAdmin(): Promise<Admin> {
    const response = await fetchData(`${MRT_API}/api/admin`, {
        method: "GET",
        credentials: "include",
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
    const response = await fetch(`${MRT_API}/api/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(credentials),
        credentials: 'include', 
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
    await fetch(`${MRT_API}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
    });
}