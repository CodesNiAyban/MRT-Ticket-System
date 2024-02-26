import { BeepCard } from "../model/beepCardModel";
import { logout } from "./adminAPI"; // Make sure to import your logout function
import { fetchData } from "./fetcher";

const MRT_API = process.env.REACT_APP_API_URL;

export async function fetchBeepCard(): Promise<BeepCard[]> {
    const response = await fetchData(`${MRT_API}/api/beepCardManager`, {
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
    return response.json();
}

export interface BeepCardInput {
    UUIC: string,
    balance: number,
    isActive: boolean
}

export async function createBeepCard(beepCard: BeepCardInput): Promise<BeepCard> {
    const response = await fetchData(`${MRT_API}/api/beepCards`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(beepCard),
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

export async function updateBeepCard(beepCardId: string, beepCard: BeepCardInput): Promise<BeepCard> {
    const response = await fetchData(`${MRT_API}/api/beepCards/${beepCardId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(beepCard),
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

export async function deleteBeepCard(beepCardsId: string) {
    try {
        const response = await fetchData(`${MRT_API}/api/beepCards/${beepCardsId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            }
        });

        if (!response.ok) {
            // Check for authorization failure (e.g., status code 401 or 403)
            if (response.status === 401 || response.status === 403) {
                console.error("Authorization failed. Logging out user.");
                await logout();
            } else {
                // Handle other errors if needed
                throw new Error(`Error: ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error("An error occurred while deleting the BeepCard:", error);
        throw error; // Rethrow the error after handling logout
    }
}