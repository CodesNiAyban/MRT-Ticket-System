import { InferSchemaType, Schema, model } from "mongoose";

const stationsSchema = new Schema({
	stationName: {type: String, require: true},
	id: {type:Number, require: true},
	// coords: {type:Array, require: true},
	// connectedTo:  {type:Array, require: true}
});
// , { timestamps: true });

type Stations = InferSchemaType<typeof stationsSchema>;

export default model<Stations>("Stations", stationsSchema);