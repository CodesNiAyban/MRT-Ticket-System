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
		const beepCards = await beepCardsModel.find({ userID: userId }).exec();

		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};


export const updateBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC; // Change variable name
	const userId = req.body.userID; // Only update userID

	try {
		// Find beep card by UUID
		const beepCard = await beepCardsModel.findOne({ beepCardUUID }).exec();

		if (!beepCard) throw createHttpError(404, "Beep card not found.");

		// Check if the userID from the database is empty
		if (!beepCard.userID) {
			// If userID is empty, replace it with the new userID
			beepCard.userID = userId;
			const updatedBeepCard = await beepCard.save();
			res.status(200).json(updatedBeepCard);
		} else if (beepCard.userID === userId) {
			// If userID already exists for the current beep card
			res.status(400).json({ message: "Beep card is already taken." });
		} else {
			// If userID is different from the one in the database
			res.status(400).json({ message: "Beep card is already assigned to another user." });
		}
	} catch (error) {
		next(error);
	}
};


export const deleteBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC; // Change variable name

	try {
		const beepCard = await beepCardsModel.findOne({ beepCardUUID }).exec();

		if (!beepCard) throw createHttpError(404, "Beep card not found.");

		// Unset the userID field
		beepCard.userID = "";

		const updatedBeepCard = await beepCard.save();

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};