import { RequestHandler } from "express";
import createHttpError from "http-errors";
import * as beepCardManagerInterface from "../interfaces/beepCardManagerInterface";
import beepCardsModel from "../models/beepCardModel";

export const getBeepCards: RequestHandler<beepCardManagerInterface.GetBeepCardsParams, unknown, unknown, unknown> = async (req, res, next) => {
	const userId = req.params.userID; // Extract userID from route parameters

	try {
		// Check if userID is provided
		if (!userId) {
			throw createHttpError(400, "UserID parameter is required.");
		}

		// Find beep cards with matching userID
		const beepCards = await beepCardsModel.find({ "UUIC": userId }).exec();

		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC;
	const userId = req.body.userID;

	try {
		const updatedBeepCard = await beepCardsModel.findOneAndUpdate(
			{ UUIC: beepCardUUID }, // Filter criteria
			{ userID: userId }, // Updated fields
			{ new: true } // Return the updated document
		).exec();

		if (!updatedBeepCard) {
			throw createHttpError(404, "Beep card not found.");
		}

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};

export const deleteBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC;
	const userID  = req.body.userID;

	try {
		// Find the beep card by UUIC
		const beepCard = await beepCardsModel.findOne({ UUIC: beepCardUUID }).exec();

		if (!beepCard) {
			throw createHttpError(404, "Beep card not found.");
		}

		// Check if the provided userID matches the current userID
		if (beepCard.userID !== userID) {
			throw createHttpError(404, "User ID does not match.");
		}

		// Update the userID field to an empty string
		beepCard.userID = "";

		// Save the updated beep card
		const updatedBeepCard = await beepCard.save();

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};