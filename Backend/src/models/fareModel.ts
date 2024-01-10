import { InferSchemaType, Schema, model } from "mongoose";

const fareSchema = new Schema({
	fare: {type: Number, required: true},
},{timestamps: true,versionKey: false});

type Fare = InferSchemaType<typeof fareSchema>;

export default model<Fare>("fare", fareSchema);