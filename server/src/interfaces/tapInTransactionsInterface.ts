export interface CreateTapInTransactionBody {
	UUIC?: string,
	tapIn?: boolean,
	initialBalance?: number,
	currStation?: string,
	fare?: number,
	currBalance?: number,
}