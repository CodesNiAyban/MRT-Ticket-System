import express from "express";
import * as StationController from "../controllers/stationsController";

const router = express.Router();

router.get("/", StationController.getStation);

router.post("/", StationController.createStation);

export default router;