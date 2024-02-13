import { RequestHandler } from "express";
import * as TapInTransactionInterface from "../interfaces/tapInTransactionsInterface";
import * as TapOutTransactionInterface from "../interfaces/tapOutTransactionsModel";
import TapTransactionModel from "../models/tapTransactionsModel";
import createHttpError from "http-errors";

export const getTapInTransactionByUUIC: RequestHandler = async (req, res, next) => {
	const UUIC = req.params.UUIC;

	try {
		const tapInTransaction = await TapTransactionModel.findOne({ UUIC }).sort({ createdAt: -1, updatedAt: -1 }).exec();
		if (!tapInTransaction) {
			return res.status(404).json({ message: "Tap in transaction not found" });
		}
		res.status(200).json(tapInTransaction);
	} catch (error) {
		next(error);
	}
};

export const createTapInTransaction: RequestHandler<unknown, unknown, TapInTransactionInterface.CreateTapInTransactionBody, unknown> = async (req, res, next) => {
	const UUIC = req.body.UUIC;
	const tapIn = req.body.tapIn;
	const initialBalance = req.body.initialBalance;
	const prevStation = req.body.prevStation;
	const currStation = req.body.currStation;
	const distance = req.body.distance;
	const fare = req.body.fare;
	const currBalance = req.body.currBalance;

	try {
		if (!UUIC) { throw createHttpError(400, "Transaction must have a UUIC"); }
		if (!initialBalance) { throw createHttpError(400, "Transaction must have a initialBalance"); }
		if (!currBalance) { throw createHttpError(400, "Transaction must have a currBalance"); }

		const newTapInTransaction = await TapTransactionModel.create({
			UUIC: UUIC,
			tapIn: tapIn,
			initialBalance: initialBalance,
			prevStation: prevStation,
			currStation: currStation,
			distance: distance,
			fare: fare,
			currBalance: currBalance
		});

		res.status(201).json(newTapInTransaction);
	} catch (error) {
		next(error);
	}
};

export const createTapOutTransaction: RequestHandler<unknown, unknown, TapOutTransactionInterface.CreateTapOutTransactionBody, unknown> = async (req, res, next) => {
	const UUIC = req.body.UUIC;
	const tapIn = req.body.tapIn;
	const initialBalance = req.body.initialBalance;
	const prevStation = req.body.prevStation;
	const currStation = req.body.currStation;
	const distance = req.body.distance;
	const fare = req.body.fare;
	const currBalance = req.body.currBalance;

	try {
		if (!UUIC) { throw createHttpError(400, "Transaction must have a UUIC"); }
		if (!initialBalance) { throw createHttpError(400, "Transaction must have a initialBalance"); }
		if (!fare) { throw createHttpError(400, "Transaction must have a fare"); }
		if (!currBalance) { throw createHttpError(400, "Transaction must have a currBalance"); }

		const newTapOutTransaction = await TapTransactionModel.create({
			UUIC: UUIC,
			tapIn: tapIn,
			initialBalance: initialBalance,
			prevStation: prevStation,
			currStation: currStation,
			distance: distance,
			fare: fare,
			currBalance: currBalance
		});

		res.status(201).json(newTapOutTransaction);
	} catch (error) {
		next(error);
	}
};

