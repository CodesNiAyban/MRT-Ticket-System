import { RequestHandler } from "express";
import * as TapInTransactionInterface from "../interfaces/tapInTransactionsInterface";
import TapInTransactionModel from "../models/tapInTransactionsModel";
import createHttpError from "http-errors";

export const createTapInTransaction: RequestHandler<unknown, unknown, TapInTransactionInterface.CreateTapInTransactionBody, unknown> = async (req, res, next) => {
	const UUIC = req.body.UUIC;
	const initialBalance = req.body.initialBalance;
	const currStation = req.body.currStation;
	const fare = req.body.fare;
	const currBalance = req.body.currBalance;

	try {
		if (!UUIC) { throw createHttpError(400, "Transaction must have a UUIC"); }
		if (!initialBalance) { throw createHttpError(400, "Transaction must have a initialBalance"); }
		if (!currStation) { throw createHttpError(400, "Transaction must have a currStation"); }
		if (!fare) { throw createHttpError(400, "Transaction must have a fare"); }
		if (!currBalance) { throw createHttpError(400, "Transaction must have a currBalance"); }

		const newTapInTransaction = await TapInTransactionModel.create({
			UUIC: UUIC,
			tapIn: true,
			initialBalance: initialBalance,
			currStation: currStation,
			fare: fare,
			currBalance: currBalance
		});

		res.status(201).json(newTapInTransaction);
	} catch (error) {
		next(error);
	}
};
