import express from "express";
import { getAdminByEmail } from "../models/adminModel";
import { authentication } from "../helpers/jwtAdmin";
import env from "../utils/validateENV";
import jwt from "jsonwebtoken";

const SESSION_SECRET = env.SESSION_SECRET;

export const login = async (req: express.Request, res: express.Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400);
		}

		const admin = await getAdminByEmail(email).select("+authentication.salt +authentication.password");

		if (!admin) {
			return res.status(400);
		}

		const expectedHash = authentication(admin.authentication?.salt?? "", password);

		if (admin.authentication?.password != expectedHash) {
			return res.status(403);
		}

		// Generate a JWT session token
		const sessionToken = jwt.sign({ adminId: admin._id }, SESSION_SECRET, { expiresIn: "1h" });

		await admin.save();

		return res.status(200).json({ token: sessionToken, admin }).end();
	} catch (err) {
		console.error(err);
		return res.status(400);
	}
};