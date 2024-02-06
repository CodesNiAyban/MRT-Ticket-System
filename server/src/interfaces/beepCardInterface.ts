export interface CreateBeepCardsBody {
	UUIC?: number,
	balance?: number,
	isActive?: boolean
}

export interface UpdateBeepCardsParams {
	beepCardId: string,
}

export interface UpdateBeepCardsBody {
	UUIC?: number,
	balance?: number,
	isActive?: boolean
}