import { InferSchemaType, model } from "mongoose";
import mongoose from "mongoose";

// Admin Config
const adminSchema = new mongoose.Schema({
	email: { type: String, required: true },
	adminname: { type: String, required: true },
	authentication: {
		password: { type: String, required: true, select: false },
		salt: { type: String, select: false },
		sessionToken: { type: String, select: false },
	},
},{versionKey: false});

type Admin = InferSchemaType<typeof adminSchema>;

export const AdminModel = mongoose.model("admin", adminSchema);

// Admin Actions
export const getAdminByEmail = (email: string) => AdminModel.findOne({ email });
export const getAdminBySessionToken = (sessionToken: string) => AdminModel.findOne({ "authentication.sessionToken": sessionToken });
export const getAdminById = (id: string) => AdminModel.findById(id);
export const createAdmin = (values: Record<string, unknown>) => new AdminModel(values).save().then((admin) => admin.toObject());
export const getAdmins = () => AdminModel.find();
export const deleteAdminById = (id: string) => AdminModel.findOneAndDelete({ _id: id });
export const updateAdminById = (id: string, values: Record<string, unknown>) => AdminModel.findByIdAndUpdate(id, values);

export default model<Admin>("admin", adminSchema);