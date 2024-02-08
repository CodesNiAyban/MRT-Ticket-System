import { RequestHandler } from "express";
import adminModel from "../models/adminModel";
import * as adminInterface from "../interfaces/adminInterface";
import * as authInterface from "../interfaces/authInterface";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../utils/validateENV";

export const getAuthenticatedAdmin: RequestHandler = async (req, res, next) => {
	const authenticatedAdminId = req.session.adminId;

	try {
		if (!authenticatedAdminId) {
			throw createHttpError(401, "Admin not authenticated");
		}

		const admin = await adminModel.findById(authenticatedAdminId)
			.select("+email")
			.exec();

		res.status(200).json(admin);
	} catch (error) {
		next(error);
	}
};

export const createAdmin: RequestHandler<unknown, unknown, adminInterface.CreateAdminBody, unknown> = async (req, res, next) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;

	try {
		if (!username) { throw createHttpError(400, "admins must have a username"); }
		if (!email) { throw createHttpError(400, "admins must have a email"); }
		if (!password) { throw createHttpError(400, "admins must have a password"); }

		const existingUsername = await adminModel.findOne({ username: username }).exec();

		if (existingUsername) {
			throw createHttpError(409, "Username already taken. Please choose a different one or log in instead.");
		}

		const existingEmail = await adminModel.findOne({ email: email }).exec();

		if (existingEmail) {
			throw createHttpError(409, "Email already taken. Please choose a different one or log in instead.");
		}

		const passwordHashed = await bcrypt.hash(password, 10); // 2nd argument is salting

		const newAdmin = await adminModel.create({
			username: username,
			email: email,
			password: passwordHashed
		});

		req.session.adminId = newAdmin._id;

		res.status(201).json(newAdmin);
	} catch (error) {
		next(error);
	}
};

export const login: RequestHandler<unknown, unknown, authInterface.LoginBody, unknown> = async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	console.log(req.body);

	try {
		if (!username || !password) { throw createHttpError(400, "Parameters Missing"); }

		const admin = await adminModel.findOne({ username: username }).select("+password +email").exec();

		if (!admin) {
			throw createHttpError(401, "Invalid Credentials.");
		}

		const passwordMatch = await bcrypt.compare(password, admin.password);

		if (!passwordMatch) {
			throw createHttpError(401, "Invalid Credentials.");
		}

		const token = jwt.sign(
			{
				username: admin.username,
				password: admin.password
			},
			env.SESSION_SECRET,
			{
				expiresIn: "24h"
			},
		);

		req.session.adminId = admin._id;

		res.status(201).json({ admin, token });
	} catch (error) {
		next(error);
	}
};

export const logout: RequestHandler = (req, res, next) => {
	req.session.destroy(error => {
		if (error) {
			next(error);
		} else {
			res.clearCookie("connect.sid"); 
			res.sendStatus(200);
		}
	});
};
