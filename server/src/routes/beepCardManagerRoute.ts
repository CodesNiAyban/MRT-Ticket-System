import express from "express";
import * as BeepCardsManagerController from "../controllers/beepCardManagerController";

const router = express.Router();

router.get("/:userID", BeepCardsManagerController.getBeepCards);

router.put("/:beepCardUUID", BeepCardsManagerController.updateBeepCardUserID); 

router.delete("/:beepCardUUID", BeepCardsManagerController.deleteBeepCardUserID); 

export default router;
