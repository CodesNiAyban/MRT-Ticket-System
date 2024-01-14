export interface Stations {
    _id: string,
    stationName: string,
    coords: number[],
    connectedTo: string[]
}