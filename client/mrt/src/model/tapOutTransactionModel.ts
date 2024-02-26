export interface TapOutTransaction {
    UUIC?: string,
    tapIn: boolean,
	initialBalance?: number,
    prevStation?: string,
	currStation?: string,
	distance?: number,
	fare?: number,
	currBalance?: number,
    createdAt: string,
    updatedAt: string,
}