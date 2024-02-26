import { RequestHandler } from "express";
import createHttpError from "http-errors";
import maintenanceModel from "../models/maintenanceModel";

const maintenanceMiddleware: RequestHandler = async (req, res, next) => {
	try {
		// Fetch maintenance mode status from the database
		const maintenance = await maintenanceModel.findOne().exec();

		// Check if maintenance mode is active
		if (maintenance && maintenance.maintenance) {
			// Maintenance mode is active, deny access
			return next(createHttpError(503, "Service under maintenance. Please try again later."));
		} else {
			// Maintenance mode is not active, proceed to the next middleware
			next();
		}
	} catch (error) {
		// Handle any errors
		next(createHttpError(500, "Internal server error"));
	}
};

export default maintenanceMiddleware;
