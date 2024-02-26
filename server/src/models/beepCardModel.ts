import { InferSchemaType, Schema, model } from "mongoose";

const beepCardsSchema = new Schema({
	UUIC: {type: Number, required: true, unique: true},
	userID: {type: String, unique: true},
	balance: {type: Number, required: true},
	isActive: {type: Boolean, required: true},
},{timestamps: true, versionKey: false});

type BeepCards = InferSchemaType<typeof beepCardsSchema>;

export default model<BeepCards>("beepCards", beepCardsSchema);