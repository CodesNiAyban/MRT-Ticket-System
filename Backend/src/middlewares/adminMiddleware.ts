import express from "express";
import { merge, get } from "lodash";
import { getAdminBySessionToken } from "../models/adminModel"; 
import jwt, { JwtPayload } from "jsonwebtoken";
// import env from "../utils/validateENV";

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	try {
		const token = req.cookies["MRT-AUTH"];

		if (!token || !token.startsWith("Bearer ")) {
			return res.status(403);
		}

		const sessionToken = token.split(" ")[1];
		
		// const SESSION_SECRET = env.SESSION_SECRET;
		const decoded = jwt.verify(sessionToken, "SESSION_SECRET") as JwtPayload;
 
		// Check if the token has expired
		const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
		if (decoded.exp && decoded.exp < currentTimestamp) {
			return res.status(401).json("Token has expired");
		}

		const existingAdmin = await getAdminBySessionToken(sessionToken);

		if (!existingAdmin) {
			return res.status(403).json("Invalid session token");
		}

		merge(req, { identity: existingAdmin });

		return next();
	} catch (error) {
		console.log(error);
		return res.status(400);
	}
};

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	try {
		const { id } = req.params;
		const currentAdminId = get(req, "identity._id") as unknown as string;

		if (!currentAdminId) {
			return res.status(400);
		}

		if (currentAdminId.toString() !== id) {
			return res.status(403);
		}

		next();
	} catch (error) {
		console.log(error);
		return res.status(400);
	}
};