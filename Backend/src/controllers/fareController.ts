import { RequestHandler } from "express";
import faresModel from "../models/fareModel";
import * as fareinterface from "../interfaces/fareInterface";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const getFare: RequestHandler = async (req, res, next) => {
	const fareId = req.params.fareId;

	try {
		const fares = await faresModel.findById(fareId).exec();

		if (!mongoose.isValidObjectId(fareId))
			throw createHttpError(400, "Invalid beep card id.");

		if (!fares)
			throw createHttpError(404, "fares not found.");
		res.status(200).json(fares);
	} catch (error) {
		next(error);
	}
};

export const updateFare: RequestHandler<fareinterface.UpdateFareParams, unknown, fareinterface.UpdateFareBody, unknown> = async (req, res, next) => {
	const fareId = req.params.fareId;
	const newfare = req.body.fare;

	try {
		// Error handling
		if (!mongoose.isValidObjectId(fareId)) throw createHttpError(400, "Invalid fares id.");
		if (!newfare) { throw createHttpError(400, "Fare not found."); }
		const fares = await faresModel.findById(fareId).exec();

		if (!fares) throw createHttpError(404, "fare not found.");

		fares.fare= newfare;

		const updateFares = await fares.save();

		res.status(200).json(updateFares);
	} catch (error) {
		next(error);

	}
};
