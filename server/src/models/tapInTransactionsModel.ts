import { InferSchemaType, Schema, model } from "mongoose";

const transactionSchema = new Schema({
	UUIC: {type: Number, required: true},
	tapIn: {type: Boolean, required: true},
	initialBalance: {type: Number, required: true},
	currStation: {type: String, required: true},
	fare: {type: Number, required: true},
	currBalance:{type: Number, required: true},
},{timestamps: true, versionKey: false});

type Transactions = InferSchemaType<typeof transactionSchema>;

export default model<Transactions>("Transactions", transactionSchema);