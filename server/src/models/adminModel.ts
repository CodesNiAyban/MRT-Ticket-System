import { InferSchemaType, Schema, model } from "mongoose";

const adminSchema = new Schema({
	username: {type: String, required: true, unique: true},
	email: {type: String, required: true, select:false, unique: true},
	password: {type: String, required: true, select:false},
},{versionKey: false});

type Admin = InferSchemaType<typeof adminSchema>;

export default model<Admin>("admin", adminSchema);