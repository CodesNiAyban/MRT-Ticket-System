import { Maintenance } from "../model/maintenanceModel";
import { fetchData } from "./fetcher";

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

export async function updateMaintenance(maintenance: Maintenance): Promise<Maintenance> {
    const response = await fetchData(`${MRT_API}/api/maintenance`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(maintenance),
        });
       
    return await response.json();
}
