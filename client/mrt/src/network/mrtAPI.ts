import { Stations } from "../model/stationsModel";
import { BeepCard } from "../model/beepCardModel";
import { Fare } from "../model/fareModel";
import { TapInTransaction } from '../model/tapInTransactionModel'
// import { logout } from "./adminAPI"; // Make sure to import your logout function
import { fetchData } from "./fetcher";
import { Maintenance } from "../model/maintenanceModel";
import { Socket, io } from "socket.io-client";

const MRT_API = process.env.REACT_APP_API_URL;

export async function fetchMaintenance(): Promise<Maintenance[]> {
    const response = await fetchData(`${MRT_API}/api/maintenance`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });

    return response.json();
}

export async function fetchStations(): Promise<Stations[]> {
    const response = await fetchData(`${MRT_API}/api/mrt`, {
        method: "GET",
    });

    if (response.status === 503) {
        alert("Service temporarily unavailable due to maintenance. Please try again later.");
        return [];
    }

    return response.json();
}

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

export async function getBeepCard(beepCardUUIC: string): Promise<BeepCard | null> {
    try {
        const response = await fetchData(`${MRT_API}/api/mrt/beepCard/${beepCardUUIC}`, {
            method: "GET",
        });

        if (response.status === 404) {
            // Beep card not found, return null
            return null;
        }

        if (response.status === 503) {
            alert("Service temporarily unavailable due to maintenance. Please try again later.");
            return null;
        }

        return await response.json();
    } catch (error) {
        // Handle other errors if needed
        console.error("Error fetching beep card:", error);
        throw error; // You can choose to throw or handle the error based on your requirements
    }
}

export async function tapInBeepCard(beepCardUUIC: string): Promise<BeepCard | null> {
    return fetchData(`${MRT_API}/api/mrt/beepCard/tapIn/${beepCardUUIC}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Comment this line
        },
        credentials: 'include',
        body: JSON.stringify({ beepCardUUIC }), // Pass an object here
    })
        .then(response => {

            if (response.status === 503) {
                alert("Service temporarily unavailable due to maintenance. Please try again later.");
                return null; // Return null when service is unavailable
            }

            return response.json();
        })
        .catch(error => {
            alert(error);
            console.error("Error tapping in beep card:", error);
            // Handle the error gracefully and return null or an empty beep card
            return null;
        });
}

export async function tapOutBeepCard(beepCardUUIC: string, amountToDeduct: number): Promise<BeepCard> {
    const response = await fetchData(`${MRT_API}/api/mrt/beepCard/tapOut/${beepCardUUIC}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Comment this line
        },
        credentials: 'include',
        body: JSON.stringify({ amount: amountToDeduct }), // Pass the amount to deduct
    });

    return await response.json();
}

export async function createTapInTransaction(transaction: TapInTransaction): Promise<TapInTransaction> {
    const response = await fetchData(`${MRT_API}/api/mrt/transactions/create/in`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
        });

    if (response.status === 503) {
        alert("Service temporarily unavailable due to maintenance. Please try again later.");
    }

    return await response.json();
}

export async function createTapOutTransaction(transaction: TapInTransaction): Promise<TapInTransaction> {
    const response = await fetchData(`${MRT_API}/api/mrt/transactions/create/out`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
        });

    if (response.status === 503) {
        alert("Service temporarily unavailable due to maintenance. Please try again later.");
    }

    return await response.json();
}

export async function getTapInTransactionByUUIC(transaction: string): Promise<TapInTransaction | null> {
    try {
        const response = await fetchData(`${MRT_API}/api/mrt/transactions/${transaction}`, {
            method: "GET",
        });

        if (response.status === 404) {
            // Beep card not found, return null
            return null;
        }

        if (response.status === 503) {
            alert("Service temporarily unavailable due to maintenance. Please try again later.");
        }

        return await response.json();
    } catch (error) {
        // Handle other errors if needed
        console.error("Error fetching transaction:", error);
        alert("No transaction found please go to the nearest teller.")
        throw error; // You can choose to throw or handle the error based on your requirements
    }
}

export async function connectWebsocket(): Promise<Socket | null> {
    try {
        const newSocket = io(`${MRT_API}`); // Use the MRT_API variable

        return newSocket;
    } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        return null; // Return null if there's an error
    }
}
