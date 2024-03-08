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

export const getBeepCard: RequestHandler = async (req, res, next) => {
	const beepCardId = req.params.beepCardId;
	try {
		const beepCards = await beepCardsModel.findById(beepCardId).exec();

		if (!mongoose.isValidObjectId(beepCardId))
			throw createHttpError(400, "Invalid beep card id");

		if (!beepCards)
			throw createHttpError(404, "beepCards not found");
		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};

export const getBeepCardByUUIC: RequestHandler = async (req, res, next) => {
	const UUIC = req.params.UUIC;

	try {
		const beepCard = await beepCardsModel.findOne({ UUIC }).exec();
		res.status(200).json(beepCard);
	} catch (error) {
		next(error);
	}
};

export const createBeepCard: RequestHandler<unknown, unknown, beepCardinterface.CreateBeepCardsBody, unknown> = async (req, res, next) => {
	const UUIC = req.body.UUIC;
	const balance = req.body.balance;

	try {
		if (!UUIC) { throw createHttpError(400, "beepCards must have a UUIC"); }
		if (!balance) { throw createHttpError(400, "beepCards must have a balance"); }

		const newBeepCards = await beepCardsModel.create({
			UUIC: UUIC,
			userID: "",
			balance: balance,
			isActive: false
		});

		res.status(201).json(newBeepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCard: RequestHandler<beepCardinterface.UpdateBeepCardsParams, unknown, beepCardinterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardId = req.params.beepCardId;
	const userId = req.body.userID;
	const newUUIC = req.body.UUIC;
	const newBalance = req.body.balance;
	const isActive = req.body.isActive; // Added isActive property

	try {
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id");
		if (!newUUIC) { throw createHttpError(400, "Beep card must have a UUIC"); }
		if (!newBalance) { throw createHttpError(400, "Beep card must have a balance"); }
		if (isActive === undefined) { throw createHttpError(400, "Beep card must have an isActive"); }

		const beepCards = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCards) throw createHttpError(404, "Beep card not found");

		beepCards.UUIC = newUUIC;
		beepCards.userID = userId;
		beepCards.balance = newBalance;
		beepCards.isActive = isActive; // Set isActive property

		const updateBeepCards = await beepCards.save();

		res.status(200).json(updateBeepCards);
	} catch (error) {
		next(error);
	}
};


export const deleteBeepCard: RequestHandler = async (req, res, next) => {
	try {
		const beepCardId = req.params.beepCardId;
		// Error handling
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id");

		const beepCards = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCards) throw createHttpError(404, "Beep card not found");

		await beepCards.deleteOne();

		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
};

export const tapIn: RequestHandler = async (req, res, next) => {
	const UUIC = req.params.UUIC;

	try {
		// Fetch the BeepCard by UUIC
		const beepCard = await beepCardsModel.findOne({ UUIC }).exec();

		if (!beepCard) {
			throw createHttpError(404, "Beep card not found");
		}

		// Update the BeepCard with the new balance and set isActive to true
		const updatedBeepCard = await beepCardsModel.findOneAndUpdate(
			{ UUIC },
			{ $set: { isActive: true } }, // Set isActive to true
			{ new: true }
		).exec();

		if (!updatedBeepCard) {
			throw createHttpError(500, "Failed to update Beep card balance");
		}

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};

export const tapOut: RequestHandler = async (req, res, next) => {
	const UUIC = req.params.UUIC;
	const amountToDeduct = req.body.amount; // Assuming the amount to deduct is provided in the request body

	try {
		// Fetch the BeepCard by UUIC
		const beepCard = await beepCardsModel.findOne({ UUIC }).exec();

		if (!beepCard) {
			throw createHttpError(404, "Beep card not found");
		}

		let newBalance = beepCard.balance - amountToDeduct;
		newBalance = Math.max(newBalance, 0); // Ensure the new balance is not negative

		// Update the BeepCard with the new balance and set isActive to true
		const updatedBeepCard = await beepCardsModel.findOneAndUpdate(
			{ UUIC },
			{ $set: { balance: newBalance, isActive: false } }, // Set isActive to true
			{ new: false }
		).exec();

		if (!updatedBeepCard) {
			throw createHttpError(500, "Failed to update Beep card balance");
		}

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};