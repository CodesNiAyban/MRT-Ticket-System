export interface CreateTapInTransactionBody {
	UUIC?: string,
	tap?: boolean,
	initialBalance?: number,
	prevStation?: string,
	currStation?: string,
	fare?: number,
	currBalance?: number,
}