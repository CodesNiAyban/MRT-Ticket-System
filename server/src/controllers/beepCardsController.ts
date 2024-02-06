import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import * as beepCardinterface from "../interfaces/beepCardInterface";
import beepCardsModel from "../models/beepCardModel";
import faresModel from "../models/fareModel";

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
			throw createHttpError(400, "Invalid beep card id.");

		if (!beepCards)
			throw createHttpError(404, "beepCards not found.");
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
			balance: balance,
		});

		res.status(201).json(newBeepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCard: RequestHandler<beepCardinterface.UpdateBeepCardsParams, unknown, beepCardinterface.UpdateBeepCardsBody, unknown> = async (req, res, next) => {
	const beepCardId = req.params.beepCardId;
	const newUUIC = req.body.UUIC;
	const newBalance = req.body.balance;

	try {
		// Error handling
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id.");
		if (!newUUIC) { throw createHttpError(400, "Beep card must have a UUIC"); }
		if (!newBalance) { throw createHttpError(400, "Beep card must have a balance"); }

		const beepCards = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCards) throw createHttpError(404, "Beep card not found.");

		beepCards.UUIC = newUUIC;
		beepCards.balance = newBalance;

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
		if (!mongoose.isValidObjectId(beepCardId)) throw createHttpError(400, "Invalid beepCards id.");

		const beepCards = await beepCardsModel.findById(beepCardId).exec();

		if (!beepCards) throw createHttpError(404, "Beep card not found.");

		await beepCards.deleteOne();

		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
};

export const deductMinimumFare: RequestHandler = async (req, res, next) => {
	const UUIC = req.params.UUIC;

	try {
		// Fetch the BeepCard by UUIC
		const beepCard = await beepCardsModel.findOne({ UUIC }).exec();

		if (!beepCard) {
			throw createHttpError(404, "Beep card not found.");
		}

		// Fetch the minimum fare
		const minimumFare = await faresModel.findOne({ fareType: "MINIMUM FARE" }).exec();

		if (!minimumFare) {
			throw createHttpError(404, "Minimum fare not found.");
		}

		// Deduct the minimum fare from the BeepCard balance
		let newBalance = beepCard.balance - minimumFare.price;
		newBalance = Math.max(newBalance, 0); // Ensure the new balance is not negative

		// Update the BeepCard with the new balance
		const updatedBeepCard = await beepCardsModel.findOneAndUpdate(
			{ UUIC },
			{ $set: { balance: newBalance } },
			{ new: true }
		).exec();

		if (!updatedBeepCard) {
			throw createHttpError(500, "Failed to update Beep card balance.");
		}

		res.status(200).json(updatedBeepCard);
	} catch (error) {
		next(error);
	}
};