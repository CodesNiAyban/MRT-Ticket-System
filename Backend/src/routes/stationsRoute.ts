import express from "express";
import * as StationController from "../controllers/stationsController";
// import { isAuthenticated, isOwner } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", StationController.getStations);

router.get("/:stationId", StationController.getStation);

router.post("/", StationController.createStation);

router.patch("/:stationId", StationController.updateStation);

router.delete("/:stationId", StationController.deleteStation);

export default router;