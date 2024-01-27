import { BeepCard } from "../model/beepCardModel"
import { fetchData } from "./fetcher";
import { logout } from "./adminAPI"; // Make sure to import your logout function

export async function fetchBeepCard(): Promise<BeepCard[]> {
    const response = await fetch("https://mrtonlineapi.onrender.com/api/beepCards", {
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
    balance: number
}

export async function createBeepCard(beepCard: BeepCardInput): Promise<BeepCard> {
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/beepCards",
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
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/beepCards/" + beepCardId,
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
        const response = await fetchData(`https://mrtonlineapi.onrender.com/api/beepCards/${beepCardsId}`, {
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