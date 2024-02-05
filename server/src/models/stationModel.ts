import { InferSchemaType, Schema, model } from "mongoose";

const stationsSchema = new Schema({
	stationName: {type: String, required: true, unique: true},
	coords: {type:Array, required: true},
	connectedTo:  {type:Array, required: true}
},{versionKey: false});

type Station = InferSchemaType<typeof stationsSchema>;

export default model<Station>("station", stationsSchema);