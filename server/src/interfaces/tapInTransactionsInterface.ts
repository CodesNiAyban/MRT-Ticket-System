export interface CreateTapInTransactionBody {
	UUIC?: string,
	tapIn?: boolean,
	initialBalance?: number,
	prevStation?: string,
	currStation?: string,
	distance?: number,
	fare?: number,
	currBalance?: number,
}