import express from "express";
import {getFare, updateFare} from "../controllers/fareController";
// import { isAuthenticated, isOwner } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/:fareId", getFare);

router.patch("/:fareId", updateFare);

export default router;