import express from "express";
import * as BeepCardsManagerController from "../controllers/beepCardManagerController";

const router = express.Router();

router.get("/", BeepCardsManagerController.getBeepCards);

router.put("/:beepCardId", BeepCardsManagerController.updateBeepCardUserID);

router.delete("/:beepCardId", BeepCardsManagerController.deleteBeepCardUserID);

export default router;
