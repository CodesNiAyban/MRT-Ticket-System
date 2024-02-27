export interface CreateBeepCardsBody {
	UUIC?: number,
	userID?: string,
	balance?: number,
	isActive?: boolean
}

export interface UpdateBeepCardsParams {
	UUIC?: number,
}

export interface GetBeepCardsParams {
	userID?: string,
}

export interface UpdateBeepCardsBody {
	UUIC?: number,
	userID?: string,
	balance?: number,
	isActive?: boolean
}