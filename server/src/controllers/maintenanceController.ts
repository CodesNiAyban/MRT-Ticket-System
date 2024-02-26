import { RequestHandler } from "express";
import * as maintenanceInterface from "../interfaces/maintenanceInterface";
import createHttpError from "http-errors";
import maintenanceModel from "../models/maintenanceModel";

export const getMaintenance: RequestHandler = async (req, res, next) => {
	try {
		const maintenance = await maintenanceModel.find().exec();
		res.status(200).json(maintenance);
	} catch (error) {
		next(error);
	}
};


export const updateMaintenance: RequestHandler<maintenanceInterface.UpdateMaintenanceParams, unknown, maintenanceInterface.UpdateMaintenanceBody, unknown> = async (req, res, next) => {
	const newMaintenance = req.body.maintenance;

	try {
		// Find the only maintenance document
		const maintenance = await maintenanceModel.findOne().exec();

		if (!maintenance) {
			throw createHttpError(404, "Maintenance not found.");
		}

		// Update the maintenance status
		maintenance.maintenance = newMaintenance;

		// Save the updated maintenance document
		const updatedMaintenance = await maintenance.save();

		res.status(200).json(updatedMaintenance);
	} catch (error) {
		next(error);
	}
};


