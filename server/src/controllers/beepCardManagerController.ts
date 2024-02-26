import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import * as beepCardinterface from "../interfaces/beepCardInterface";
import beepCardsModel from "../models/beepCardModel";

export const getBeepCards: RequestHandler = async (req, res, next) => {
	try {
		const beepCards = await beepCardsModel.find().exec();
		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCardUserID: RequestHandler<beepCardinterface.UpdateBeepCardsParams, unknown, beepCardinterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardId = req.params.beepCardId;
	const userId = req.body.userID; // Only update userID

	try {
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id.");
		if (!userId) { throw createHttpError(400, "Beep card must have a userID"); }

		const beepCard = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCard) throw createHttpError(404, "Beep card not found.");

		beepCard.userID = userId; // Update only the userID

		const updatedBeepCard = await beepCard.save();

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};

export const deleteBeepCardUserID: RequestHandler<beepCardinterface.UpdateBeepCardsParams, unknown, beepCardinterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardId = req.params.beepCardId;

	try {
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id.");

		const beepCard = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCard) throw createHttpError(404, "Beep card not found.");

		// Unset the userID field
		beepCard.userID = "";

		const updatedBeepCard = await beepCard.save();

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};
