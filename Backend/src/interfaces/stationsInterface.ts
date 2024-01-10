/* eslint-disable semi */

export interface CreateStationBody{
	stationName?: string,
	coords?: number[],
	connectedTo?: string[]
}

export interface UpdateStationParams{
	stationId: string,
}

export interface UpdateStationBody{
	stationName?: string,
	coords?: number[],
	connectedTo?: string[]
}
