import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import * as fareinterface from "../interfaces/fareInterface";
import faresModel from "../models/fareModel";

export const getFares: RequestHandler = async (req, res, next) => {
	try {
		const fares = await faresModel.find().exec();
		res.status(200).json(fares);
	} catch (error) {
		next(error);
	}
};

export const getFare: RequestHandler = async (req, res, next) => {
	const fareId = req.params.fareId;

	try {
		const fares = await faresModel.findById(fareId).exec();

		if (!mongoose.isValidObjectId(fareId))
			throw createHttpError(400, "Invalid beep card id");

		if (!fares)
			throw createHttpError(404, "fares not found");
		res.status(200).json(fares);
	} catch (error) {
		next(error);
	}
};

export const updateFare: RequestHandler<fareinterface.UpdateFareParams, unknown, fareinterface.UpdateFareBody, unknown> = async (req, res, next) => {
	const fareId = req.params.fareId;
	const newfareType = req.body.fareType;
	const newPrice = req.body.price;

	try {
		// Error handling
		if (!mongoose.isValidObjectId(fareId)) throw createHttpError(400, "Invalid fares id");
		if (!newfareType) { throw createHttpError(400, "FareType not found"); }
		if (!newPrice) { throw createHttpError(400, "Price not found"); }

		const fares = await faresModel.findById(fareId).exec();

		if (!fares) throw createHttpError(404, "fare not found");

		fares.fareType = newfareType;
		fares.price = newPrice;

		const updateFares = await fares.save();

		res.status(200).json(updateFares);
	} catch (error) {
		next(error);

	}
};

