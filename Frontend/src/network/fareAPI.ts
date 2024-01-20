import { Fare } from "../model/fareModel"
import { fetchData } from "./fetcher";

export async function fetchFare(): Promise<Fare[]> {
    const response = await fetch("/api/fare", { method: "GET" });
    return response.json();
}

export interface FareInput {
    fareType: string,
    price: number,
}

export async function updateFare(FareId: string, Fare: FareInput): Promise<Fare> {
    const response = await fetchData("/api/fare/" + FareId,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Fare),
        });
    return response.json();
}