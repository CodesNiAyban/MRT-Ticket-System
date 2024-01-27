import { Stations } from "../model/stationsModel"
import { fetchData } from "./fetcher";
import { logout } from "./adminAPI"; // Make sure to import your logout function

export async function fetchStations(): Promise<Stations[]> {
    const response = await fetch("https://mrtonlineapi.onrender.com/api/stations", {
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
        } else {
            // Handle other errors if needed
            throw new Error(`Error: ${response.statusText}`);
        }
    }

    return response.json();
}

export interface StationInput {
    stationName: string,
    coords: number[],
    connectedTo: string[]
}

export async function createStation(station: StationInput): Promise<Stations> {
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/stations",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(station),
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

    return response.json();
}

export async function updateStation(stationId: string, station: StationInput): Promise<Stations> {
    const response = await fetchData("https://mrtonlineapi.onrender.com/api/stations/" + stationId,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(station),
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

    return response.json();
}

export async function deleteStation(stationId: string) {
    try {
        const response = await fetchData(`https://mrtonlineapi.onrender.com/api/stations/${stationId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
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
        console.error("An error occurred while deleting the station:", error);
        throw error; // Rethrow the error after handling logout
    }
}