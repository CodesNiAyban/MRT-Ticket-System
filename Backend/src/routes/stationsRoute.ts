import express from "express";
import * as StationController from "../controllers/stationsController";

const router = express.Router();

router.get("/", StationController.getStations);

router.get("/:stationId", StationController.getStation);

router.post("/", StationController.createStation);

router.patch("/:stationId", StationController.updateStation);

export default router;