import express from "express";
import { getStations, getStation } from "../controllers/stationsController";
import { getFares } from "../controllers/fareController";
import { getBeepCardByUUIC, deductMinimumFare  } from "../controllers/beepCardsController";

const router = express.Router();

router.get("/", getStations);

router.get("/:stationId", getStation);

router.get("/beepCard/:UUIC", getBeepCardByUUIC);

router.get("/fares/getAllFares", getFares);

router.patch("/beepCard/tapIn/:UUIC", deductMinimumFare);

export default router;