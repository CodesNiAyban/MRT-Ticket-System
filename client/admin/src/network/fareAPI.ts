import { Fare } from "../model/fareModel";
import { logout } from "./adminAPI"; // Make sure to import your logout function
import { fetchData } from "./fetcher";

const MRT_API = process.env.REACT_APP_API_URL;

export async function fetchFares(): Promise<Fare[]> {
    const response = await fetchData(`${MRT_API}/api/mrt/fares/getAllFares`, {
        method: "GET",
    });

    if (response.status === 503) {
        alert("Service temporarily unavailable due to maintenance. Please try again later.");
        return [];
    }

    return response.json();
}

export interface FareInput {
    fareType: string;
    price: number;
}

export async function updateFare(FareId: string, Fare: FareInput): Promise<Fare> {
    try {
        const response = await fetchData(`${MRT_API}/api/fare/` + FareId, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(Fare),
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

        return response.json();
    } catch (error) {
        console.error("Error updating fare:", error);
        throw error; // Propagate the error up
    }
}
