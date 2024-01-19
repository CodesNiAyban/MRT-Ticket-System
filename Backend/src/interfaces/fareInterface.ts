
export interface UpdateFareParams {
	fareId: string,
}

export interface UpdateFareBody {
	fare: number,
	minimumFare : number,
	defaultLoad : number,
	penaltyFee : number,
}