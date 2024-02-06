import express from "express";
import { deductMinimumFare, getBeepCardByUUIC } from "../controllers/beepCardsController";
import { getFares } from "../controllers/fareController";
import { getStation, getStations } from "../controllers/stationsController";
import { createTapInTransaction } from "../controllers/transactionController";

const router = express.Router();

router.get("/", getStations);

router.get("/:stationId", getStation);

router.get("/beepCard/:UUIC", getBeepCardByUUIC);

router.get("/fares/getAllFares", getFares);

router.patch("/beepCard/tapIn/:UUIC", deductMinimumFare);

router.post("/transactions/create", createTapInTransaction);

export default router;