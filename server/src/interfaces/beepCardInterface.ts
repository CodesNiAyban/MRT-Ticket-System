export interface CreateBeepCardsBody {
	UUIC?: number,
	userID: string,
	balance?: number,
	isActive?: boolean
}

export interface UpdateBeepCardsParams {
	beepCardId: string,
}

export interface UpdateBeepCardsBody {
	UUIC?: number,
	userID: string,
	balance?: number,
	isActive?: boolean
}