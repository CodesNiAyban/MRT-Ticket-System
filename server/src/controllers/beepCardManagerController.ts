import { RequestHandler } from "express";
import beepCardsModel from "../models/beepCardModel";

export const getBeepCards: RequestHandler = async (req, res, next) => {
	try {
		const beepCards = await beepCardsModel.find().exec();
		res.status(200).json(beepCards);
	} catch (error) {
		next(error);
	}
};

