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
			throw createHttpError(400, "Invalid station id");

		if (!station)
			throw createHttpError(404, "Station not found");
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
		if (!stationName) { throw createHttpError(400, "Station must have a stationName"); }
		if (!coords) { throw createHttpError(400, "Station must have coords"); }
		if (!connectedTo) { throw createHttpError(400, "Station must have connectedTo"); }

		// Create the new station
		const newStation = await StationModel.create({
			stationName: stationName,
			coords: coords,
			connectedTo: connectedTo
		});

		// Append the ID of the new station to the connectedTo arrays of other stations
		await Promise.all(connectedTo.map(async (stationId: string) => {
			await StationModel.findByIdAndUpdate(stationId, { $push: { connectedTo: newStation._id } });
		}));

		// Respond with the newly created station
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
		if (!mongoose.isValidObjectId(stationId)) throw createHttpError(400, "Invalid station id");
		if (!newStationName) { throw createHttpError(400, "Station must have a stationName"); }
		if (!newCoords) { throw createHttpError(400, "Station must have coords"); }
		if (!newConnectedTo) { throw createHttpError(400, "Station must have connectedTo"); }

		const station = await StationModel.findById(stationId).exec();

		if (!station) throw createHttpError(404, "Station not found");

		// Compare previous connectedTo array with newConnectedTo array
		const prevConnectedTo = station.connectedTo;

		// Remove stations that were disconnected
		await Promise.all(prevConnectedTo.map(async (prevConnectedStationId: string) => {
			if (!newConnectedTo.includes(prevConnectedStationId)) {
				// Remove the station from the connectedTo array of other stations
				await StationModel.findByIdAndUpdate(prevConnectedStationId, { $pull: { connectedTo: stationId } });
			}
		}));

		// Reconnect existing stations and update the connected stations
		await Promise.all(newConnectedTo.map(async (newConnectedStationId: string) => {
			if (newConnectedStationId !== stationId && !prevConnectedTo.includes(newConnectedStationId)) {
				// Add the station to the connectedTo array of other stations
				await StationModel.findByIdAndUpdate(newConnectedStationId, { $push: { connectedTo: stationId } });

				// Update the station's connectedTo array with the new connection
				await StationModel.findByIdAndUpdate(stationId, { $push: { connectedTo: newConnectedStationId } });
			}
		}));

		// Update the station details
		station.stationName = newStationName;
		station.coords = newCoords;
		station.connectedTo = newConnectedTo;

		const updatedStation = await station.save();

		res.status(200).json(updatedStation);
	} catch (error) {
		next(error);
	}
};

export const deleteStation: RequestHandler = async (req, res, next) => {
	try {
		const stationId = req.params.stationId;
		// Error handling
		if (!mongoose.isValidObjectId(stationId)) throw createHttpError(400, "Invalid station id");

		const station = await StationModel.findById(stationId).exec();

		if (!station) throw createHttpError(404, "Station not found");

		// Remove the station ID from the connectedTo arrays of other stations
		const connectedStations = await StationModel.find({ connectedTo: stationId }).exec();

		await Promise.all(connectedStations.map(async (connectedStation) => {
			connectedStation.connectedTo = connectedStation.connectedTo.filter(id => id !== stationId);
			await connectedStation.save();
		}));

		// Delete the station
		await station.deleteOne();

		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
};
