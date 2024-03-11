import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel";
import { fetchData } from "./fetcher";

const MRT_API = process.env.REACT_APP_API_URL;

export async function getLoggedInAdmin(): Promise<Admin> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        throw new Error("Authorization token not found");
    }

    const response = await fetchData(`${MRT_API}/api/admin`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        // Check for authorization failure (e.g., status code 401 or 403)
        if (response.status === 401 || response.status === 403) {
            console.error("Authorization failed. Logging out user");
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

export async function adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${MRT_API}/api/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
    });

    if (!response.ok) {
        // Check for authorization failure (e.g., status code 401 or 403)
        if (response.status === 401 || response.status === 403) {
            console.error("Authorization failed. Logging out user");
            await logout();
        }

        // Handle other errors if needed
        throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token); // Update token in local storage
    return data;
}

export async function logout() {
    localStorage.removeItem('authToken');
    await fetch(`${MRT_API}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
    }); // Remove token from local storage
}
