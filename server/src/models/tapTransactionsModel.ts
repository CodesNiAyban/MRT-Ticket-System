import { InferSchemaType, Schema, model } from "mongoose";

const transactionSchema = new Schema({
	UUIC: {type: Number, required: true},
	tapIn: {type: Boolean, required: true},
	initialBalance: {type: String, required: true},
	prevStation: {type: String},
	currStation: {type: String},
	distance: {type: Number},
	fare: {type: Number, required: true},
	currBalance:{type: Number, required: true},
},{timestamps: true, versionKey: false});

type Transactions = InferSchemaType<typeof transactionSchema>;

export default model<Transactions>("Transactions", transactionSchema);
