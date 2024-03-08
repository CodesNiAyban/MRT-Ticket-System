import { RequestHandler } from "express";
import createHttpError from "http-errors";
import * as beepCardManagerInterface from "../interfaces/beepCardManagerInterface";
import beepCardsModel from "../models/beepCardModel";
import TapTransactionModel from "../models/tapTransactionsModel";

export const getBeepCards: RequestHandler<beepCardManagerInterface.GetBeepCardsParams, unknown, unknown, unknown> = async (req, res, next) => {
	const userId = req.params.userID; // Extract userID from route parameters

	try {
		// Check if userID is provided
		if (!userId) {
			throw createHttpError(400, "UserID parameter is required");
		}

		// Find beep cards with matching userID
		const beepCards = await beepCardsModel.find({ userID: userId }).exec();

		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC;
	const userId = req.body.userID;

	try {
		const existingBeepCard = await beepCardsModel.findOne({ userID: { $ne: "" }, UUIC: beepCardUUID }).exec();

		if (existingBeepCard) {
			throw createHttpError(400, "Beep Card is already taken");
		}

		const updatedBeepCard = await beepCardsModel.findOneAndUpdate(
			{ UUIC: beepCardUUID }, // Filter criteria
			{ userID: userId }, // Updated fields
			{ new: true } // Return the updated document
		).exec();

		if (!updatedBeepCard) {
			throw createHttpError(404, "Beep card not found");
		}

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};

export const deleteBeepCardUserID: RequestHandler<beepCardManagerInterface.UpdateBeepCardsParams, unknown, beepCardManagerInterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardUUID = req.params.UUIC;
	const userID = req.body.userID;

	try {
		// Find the beep card by UUIC
		const beepCard = await beepCardsModel.findOne({ UUIC: beepCardUUID }).exec();

		if (!beepCard) {
			throw createHttpError(404, "Beep card not found");
		}

		// Check if the provided userID matches the current userID
		if (beepCard.userID !== userID) {
			throw createHttpError(404, "User ID does not match");
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

export const getTapTransactionsByUserID: RequestHandler = async (req, res, next) => {
	const userID = req.params.userID;
	try {
		// Find beep cards of the user
		const userBeepCards = await beepCardsModel.find({ userID }).exec();

		if (!userBeepCards || userBeepCards.length === 0) {
			return res.status(404).json({ message: "User's beep cards not found" });
		}

		// Extract UUIDs of user's beep cards
		const userBeepCardUUIDs = userBeepCards.map(beepCard => beepCard.UUIC);

		// Find all tap-out transactions for the user's beep cards
		const tapOutTransactions = await TapTransactionModel.find({ UUIC: { $in: userBeepCardUUIDs } })
			.sort({ createdAt: -1 }) // Sort in descending order based on createdAt
			.exec();

		if (!tapOutTransactions || tapOutTransactions.length === 0) {
			return res.status(404).json({ message: "Tap out transactions not found" });
		}

		res.status(200).json(tapOutTransactions);
	} catch (error) {
		next(error);
	}
};


