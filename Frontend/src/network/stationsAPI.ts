import { Stations } from "../model/stationsModel"
import { fetchData } from "./fetcher";

export async function fetchStations(): Promise<Stations[]> {
    const response = await fetch("/api/stations", { method: "GET", 
    headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },});
    return response.json();
}

export interface StationInput {
    stationName: string,
    coords: number[],
    connectedTo: string[]
}

export async function createStation(station: StationInput): Promise<Stations> {
    const response = await fetchData("api/stations",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(station),
        });
    return response.json();
}

export async function updateStation(stationId: string, station: StationInput): Promise<Stations> {
    const response = await fetchData("/api/stations/" + stationId,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(station),
        });
    return response.json();
}

export async function deleteStation(stationsId: string) {
    await fetchData("api/stations/" + stationsId, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });
}