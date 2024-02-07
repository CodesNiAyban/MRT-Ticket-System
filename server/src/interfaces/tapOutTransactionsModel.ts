export interface CreateTapOutTransactionBody {
	UUIC?: string,
	tapIn?: boolean,
	initialBalance?: number,
	prevStation?: string,
	currStation?: string,
	fare?: number,
	currBalance?: number,
}