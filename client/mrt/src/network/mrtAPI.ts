import { Stations } from "../model/stationsModel";
import { BeepCard } from "../model/beepCardModel";
import { Fare } from "../model/fareModel";
import { TapInTransaction } from '../model/tapInTransactionModel'
// import { logout } from "./adminAPI"; // Make sure to import your logout function
import { fetchData } from "./fetcher";

const MRT_API = process.env.REACT_APP_API_URL;

export async function fetchStations(): Promise<Stations[]> {
    const response = await fetchData(`${MRT_API}/api/mrt`, {
        method: "GET",
    });

    return response.json();
}

export async function fetchFares(): Promise<Fare[]> {
    const response = await fetchData(`${MRT_API}/api/mrt/fares/getAllFares`, {
        method: "GET",
    });

    return response.json();
}

export async function getBeepCard(beepCardUUIC: string): Promise<BeepCard | null> {
    try {
        const response = await fetchData(`${MRT_API}/api/mrt/beepCard/${beepCardUUIC}`, {
            method: "GET",
        });

        if (response.status === 404) {
            // Beep card not found, return null
            return null;
        }

        return await response.json();
    } catch (error) {
        // Handle other errors if needed
        console.error("Error fetching beep card:", error);
        throw error; // You can choose to throw or handle the error based on your requirements
    }
}

export async function tapInBeepCard(beepCardUUIC: string): Promise<BeepCard> {
    const response = await fetchData(`${MRT_API}/api/mrt/beepCard/tapIn/${beepCardUUIC}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Comment this line
        },
        credentials: 'include',
        body: JSON.stringify({ beepCardUUIC }), // Pass an object here
    });

    return await response.json();
}

export async function createTapInTransaction(transaction: TapInTransaction): Promise<TapInTransaction> {
    const response = await fetchData(`${MRT_API}/api/mrt/transactions/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
        });
    return await response.json();
}