import express from "express";
import { getAdminByEmail, createAdmin } from "../models/adminModel";
import { authentication, random } from "../helpers/jwtAdmin";
import { deleteAdminById, getAdmins, getAdminById } from "../models/adminModel";
import dotenv from "dotenv";

dotenv.config();


export const register = async (req: express.Request, res: express.Response) => {
	try {
		const { email, password, adminname } = req.body;

		if (!email || !password || !adminname) {
			return res.sendStatus(400);
		}

		const existingAdmin = await getAdminByEmail(email);

		if (existingAdmin) {
			res.sendStatus(400);
		}

		const salt = random();
		const admin = await createAdmin({
			email,
			adminname,
			authentication: {
				salt,
				password: authentication(salt, password),
			},
		});

		res.status(200).json(admin).end();
	} catch (error) {
		console.log(error);
	}
};

export const getAllAdmins = async (req: express.Request, res: express.Response) => {
	try {
		const admins = await getAdmins();

		return res.status(200).json(admins);
	} catch (error) {
		console.log(error);
		return res.sendStatus(400);
	}
};

export const deleteAdmin = async (req: express.Request, res: express.Response) => {
	try {
		const { id } = req.params;

		const deletedAdmin = await deleteAdminById(id);

		return res.json(deletedAdmin);
	} catch (error) {
		console.log(error);
		return res.sendStatus(400);
	}
};

export const updateAdmin = async (req: express.Request, res: express.Response) => {
	try {
		const { id } = req.params;
		const { adminname } = req.body;

		if (!adminname) {
			return res.sendStatus(400);
		}

		const admin = await getAdminById(id);

		admin!.adminname = adminname;
		await admin!.save();

		return res.status(200).json(admin).end();
	} catch (error) {
		console.log(error);
		return res.sendStatus(400);
	}
};

export { createAdmin };
