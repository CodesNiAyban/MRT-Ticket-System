import express from "express";
import { getMaintenance, updateMaintenance } from "../controllers/maintenanceController";

const router = express.Router();

router.get("/",  getMaintenance);

router.post("/", updateMaintenance);

export default router;