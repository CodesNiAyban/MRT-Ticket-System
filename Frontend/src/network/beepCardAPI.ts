import { BeepCard } from "../model/beepCardModel"
import { fetchData } from "./fetcher";

export async function fetchBeepCard(): Promise<BeepCard[]> {
    const response = await fetch("/api/beepCards", { method: "GET" });
    return response.json();
}

export interface BeepCardInput {
    UUIC: string,
	balance: number
}

export async function createBeepCard(beepCard: BeepCardInput): Promise<BeepCard> {
    const response = await fetchData("api/beepCards",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(beepCard),
        });
    alert("BeepCard with " + beepCard.UUIC + " Created")
    return response.json();
}

export async function updateBeepCard(beepCardId: string, beepCard: BeepCardInput): Promise<BeepCard> {
    const response = await fetchData("/api/beepCards/" + beepCardId,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(beepCard),
        });
    alert("BeepCard with " + beepCard.UUIC + " Updated")
    return response.json();
}

export async function deleteBeepCard(beepCardsId: string) {
    await fetchData("api/beepCards/" + beepCardsId, { method: "DELETE" });
    alert("BeepCard with deleted")
}
