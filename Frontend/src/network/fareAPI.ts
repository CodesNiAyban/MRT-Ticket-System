import { Fare } from "../model/fareModel";
import { fetchData } from "./fetcher";
import { logout } from "./adminAPI"; // Make sure to import your logout function

export async function fetchFare(): Promise<Fare[]> {
    try {
        const response = await fetchData("https://mrtonlineapi.onrender.com/api/fare", {
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
    } catch (error) {
        console.error("Error fetching fare:", error);
        throw error; // Propagate the error up
    }
}

export interface FareInput {
    fareType: string;
    price: number;
}

export async function updateFare(FareId: string, Fare: FareInput): Promise<Fare> {
    try {
        const response = await fetchData("https://mrtonlineapi.onrender.com/api/fare/" + FareId, {
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
                console.error("Authorization failed. Logging out user.");
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
