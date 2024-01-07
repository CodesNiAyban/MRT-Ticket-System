import { RequestHandler } from "express";
import StationModel from "../models/stationModel";

export const getStation: RequestHandler = async (req, res, next) => {
	try {
		const stations = await StationModel.find().exec();
		res.status(200).json(stations);
	} catch (error) {
		next(error);
	}

};

export const createStation: RequestHandler = async (req, res, next) => {
	const id = req.body.id;
	const stationName = req.body.id;
	const coords = req.body.id;
	const connectedTo = req.body.id;

	try {
		const newStation = await StationModel.create({
			id: id,
			stationName: stationName,
			coords: coords,
			connectedTo: connectedTo
		});

		res.status(201).json(newStation);
	} catch (error) {
		next(error);
	}
};