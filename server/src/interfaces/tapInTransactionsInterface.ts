export interface CreateTapInTransactionBody {
	UUIC?: string,
	tapIn?: boolean,
	initialBalance?: number,
	prevStation?: string,
	currStation?: string,
	fare?: number,
	currBalance?: number,
}