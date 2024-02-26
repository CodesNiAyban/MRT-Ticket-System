import express from "express";
import * as BeepCardsManagerController from "../controllers/beepCardManagerController";

const router = express.Router();

router.get("/", BeepCardsManagerController.getBeepCards);

export default router;