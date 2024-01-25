import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import { fetchData } from "./fetcher"

export async function getLoggedInAdmin(): Promise<Admin> {
    const response = await fetchData("/api/admin", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });
    return await response.json();
}

export async function adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetchData("/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(credentials),
    });
    return await response.json();
}

interface LoginResponse {
    admin: Admin;
    token: string;
}

export async function logout() {
    await fetchData("/api/admin/logout", {
        method: "POST"
    });
}