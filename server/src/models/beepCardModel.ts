import { InferSchemaType, Schema, model } from "mongoose";

const beepCardsSchema = new Schema({
	UUIC: {type: Number, required: true, unique: true},
	balance: {type: Number, required: true},
},{timestamps: true, versionKey: false});

type BeepCards = InferSchemaType<typeof beepCardsSchema>;

export default model<BeepCards>("beepCards", beepCardsSchema);