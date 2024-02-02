import { RequestHandler } from "express";
import * as stationsInterface from "../interfaces/stationsInterface";
import StationModel from "../models/stationModel";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const getStations: RequestHandler = async (req, res, next) => {
	try {
		const stations = await StationModel.find().exec();
		res.status(200).json(stations);
	} catch (error) {
		next(error);
	}
};

export const getStation: RequestHandler = async (req, res, next) => {
	const stationId = req.params.stationId;

	try {
		const station = await StationModel.findById(stationId).exec();

		if (!mongoose.isValidObjectId(stationId))
			throw createHttpError(400, "Invalid station id.");

		if (!station)
			throw createHttpError(404, "Station not found.");
		res.status(200).json(station);
	} catch (error) {
		next(error);
	}
};

export const createStation: RequestHandler<unknown, unknown, stationsInterface.CreateStationBody, unknown> = async (req, res, next) => {
	const stationName = req.body.stationName;
	const coords = req.body.coords;
	const connectedTo = req.body.connectedTo;

	try {
		if (!stationName) { throw createHttpError(400, "Station must have a staionName"); }
		if (!coords) { throw createHttpError(400, "Station must have a coords"); }
		if (!connectedTo) { throw createHttpError(400, "Station must have a connectedTo"); }

		const newStation = await StationModel.create({
			stationName: stationName,
			coords: coords,
			connectedTo: connectedTo
		});

		res.status(201).json(newStation);
	} catch (error) {
		next(error);
	}
};

export const updateStation: RequestHandler<stationsInterface.UpdateStationParams, unknown, stationsInterface.UpdateStationBody, unknown> = async (req, res, next) => {
	const stationId = req.params.stationId;
	const newStationName = req.body.stationName;
	const newCoords = req.body.coords;
	const newConnectedTo = req.body.connectedTo;

	try {
		// Error handling
		if (!mongoose.isValidObjectId(stationId)) throw createHttpError(400, "Invalid station id.");
		if (!newStationName) { throw createHttpError(400, "Station must have a stationName"); }
		if (!newCoords) { throw createHttpError(400, "Station must have coords"); }
		if (!newConnectedTo) { throw createHttpError(400, "Station must have connectedTo"); }

		const station = await StationModel.findById(stationId).exec();

		if (!station) throw createHttpError(404, "Station not found.");

		// Remove connections that are not present in the updated connectedTo field
		const removedConnections = station.connectedTo.filter(
			(connectedStationId) => !newConnectedTo.includes(connectedStationId)
		);

		// Update the connectedTo field for stations that are affected by removed connections
		if (removedConnections && removedConnections.length > 0) {
			await Promise.all(
				removedConnections.map(async (removedStationId) => {
					const removedStation = await StationModel.findById(removedStationId).exec();
					if (removedStation) {
						removedStation.connectedTo = removedStation.connectedTo.filter(
							(connectedStationId) => connectedStationId !== stationId
						);
						await removedStation.save();
					}
				})
			);
		}

		station.stationName = newStationName;
		station.coords = newCoords;
		station.connectedTo = newConnectedTo;

		const updateStation = await station.save();

		res.status(200).json(updateStation);
	} catch (error) {
		next(error);
	}
};

export const updateStations: RequestHandler<unknown, unknown, stationsInterface.UpdateStationsBody, unknown> = async (req, res, next) => {
	try {
		const { stations: updatedStations } = req.body;

		const bulkUpdateOps = updatedStations.map((updatedStation) => {
			const { _id, stationName, coords, connectedTo } = updatedStation;

			// Ensure that the own ID is not in the connectedTo array
			const filteredConnectedTo = connectedTo.filter(id => id !== _id);

			return {
				updateOne: {
					filter: { _id: new mongoose.Types.ObjectId(_id) },
					update: { $set: { stationName, coords, connectedTo: filteredConnectedTo } },
				},
			};
		});

		const result = await StationModel.bulkWrite(bulkUpdateOps);

		res.status(200).json({ updatedCount: result.modifiedCount });
	} catch (error) {
		console.error("An error occurred while updating stations:", error);
		next(error);
	}
};

export const deleteStation: RequestHandler = async (req, res, next) => {
	try {
		const stationId = req.params.stationId;
		// Error handling
		if (!mongoose.isValidObjectId(stationId)) throw createHttpError(400, "Invalid station id.");

		const station = await StationModel.findById(stationId).exec();

		if (!station) throw createHttpError(404, "Station not found.");

		await station.deleteOne();

		res.sendStatus(204);
	} catch (error) {
		next(error);
	}

};