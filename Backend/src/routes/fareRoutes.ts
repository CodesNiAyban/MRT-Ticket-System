import express from "express";
import {getFare, updateFare, getFares} from "../controllers/fareController";
// import { isAuthenticated, isOwner } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", getFares);

router.get("/:fareId", getFare);

router.patch("/:fareId", updateFare);

export default router;