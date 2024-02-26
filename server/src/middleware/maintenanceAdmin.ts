import { RequestHandler } from "express";
import createHttpError from "http-errors";
import maintenanceModel from "../models/maintenanceModel";

const adminMaintenanceMiddleware: RequestHandler = async (req, res, next) => {
	try {
		// Fetch maintenance mode status from the database
		const maintenance = await maintenanceModel.findOne().exec();

		// Check if maintenance mode is not active
		if (!maintenance || !maintenance.maintenance) {
			// Maintenance mode is active, deny access to admin page
			return next(createHttpError(403, "Maintenance mode not is active. Editing not allowed."));
		} else {
			next();
		}
	} catch (error) {
		// Handle any errors
		next(createHttpError(500, "Internal server error"));
	}
};

export default adminMaintenanceMiddleware;
