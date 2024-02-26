import { InferSchemaType, Schema, model } from "mongoose";

const maintenanceSchema = new Schema({
	maintenance: {type: Boolean, required: true},
},{versionKey: false});

type Maintenance = InferSchemaType<typeof maintenanceSchema>;

export default model<Maintenance>("maintenance", maintenanceSchema);