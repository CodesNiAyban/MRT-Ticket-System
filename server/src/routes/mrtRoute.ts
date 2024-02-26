import express from "express";
import { tapIn, tapOut, getBeepCardByUUIC } from "../controllers/beepCardsController";
import { getFares } from "../controllers/fareController";
import { getStation, getStations } from "../controllers/stationsController";
import { createTapInTransaction, getTapInTransactionByUUIC } from "../controllers/transactionController";
import maintenanceMrt from "../middleware/maintenanceMrt";

const router = express.Router();

router.get("/", getStations);

router.get("/:stationId", getStation);

router.get("/beepCard/:UUIC", getBeepCardByUUIC);

router.get("/fares/getAllFares", getFares);

router.get("/transactions/:UUIC", getTapInTransactionByUUIC);

router.patch("/beepCard/tapIn/:UUIC", maintenanceMrt, tapIn);

router.patch("/beepCard/tapOut/:UUIC", tapOut);

router.post("/transactions/create", createTapInTransaction);

export default router;