import { RequestHandler } from "express";
import beepCardsModel from "../models/beepCardModel";
import * as beepCardinterface from "../interfaces/beepCardInterface";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import express from "express";

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

export const createBeepCard: RequestHandler<unknown, unknown, beepCardinterface.CreatebeepCardsBody, unknown> = async (req, res, next) => {
	const UUIC = req.body.UUIC;
	const balance = req.body.balance;

	try {
		if (!UUIC) { throw createHttpError(400, "beepCards must have a staionName"); }
		if (!balance) { throw createHttpError(400, "beepCards must have a coords"); }

		const newBeepCards = await beepCardsModel.create({
			UUIC: UUIC,
			balance: balance,
		});

		res.status(201).json(newBeepCards);
	} catch (error) {
		next(error);
	}
};

export const updateBeepCard = async (req: express.Request, res: express.Response) => {
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
		console.log(error);
		return res.sendStatus(400);

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