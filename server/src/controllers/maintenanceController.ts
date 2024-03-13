import { RequestHandler } from "express";
import * as maintenanceInterface from "../interfaces/maintenanceInterface";
import createHttpError from "http-errors";
import maintenanceModel from "../models/maintenanceModel";
import StationModel from "../models/stationModel";
import BeepCardModel from "../models/beepCardModel";


export const getMaintenance: RequestHandler = async (req, res, next) => {
	try {
		const maintenance = await maintenanceModel.find().exec();
		res.status(200).json(maintenance);
	} catch (error) {
		next(error);
	}
};


export const updateMaintenance: RequestHandler<unknown, unknown, maintenanceInterface.UpdateMaintenanceBody, unknown> = async (req, res, next) => {
	const newMaintenance = req.body.maintenance;

	try {
		// Find the only maintenance document
		const maintenance = await maintenanceModel.findOne().exec();

		if (!maintenance) {
			throw createHttpError(404, "Maintenance not found");
		}

		// If maintenance is set to true, check if all stations have connectedTo
		if (newMaintenance === false) {
			const stations = await StationModel.find().exec();
			const hasDisconnectedStations = stations.some(station => station.connectedTo.length === 0);
			if (hasDisconnectedStations) {
				throw createHttpError(400, "Cannot deploy MRT Online Tap while there are disconnected stations");
			}
		} else { // If maintenance is set to false
			// Check if any beep card is active
			const activeBeepCards = await BeepCardModel.find({ isActive: true }).exec();
			if (activeBeepCards.length > 0) {
				throw createHttpError(400, "Cannot set maintenance to false while there are active beep cards");
			}
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
