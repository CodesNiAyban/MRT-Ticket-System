export interface TapInTransaction {
    UUIC?: string,
	tapIn: boolean,
	initialBalance?: number,
	prevStation?: string,
	currStation?: string,
	fare?: number,
	currBalance?: number,
    createdAt: string,
    updatedAt: string,
}