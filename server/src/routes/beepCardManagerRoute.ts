import express from "express";
import * as BeepCardsManagerController from "../controllers/beepCardManagerController";

const router = express.Router();

router.get("/:userID", BeepCardsManagerController.getBeepCards);

router.get("/transactions/:userID", BeepCardsManagerController.getTapTransactionsByUserID); 

router.put("/link/:UUIC", BeepCardsManagerController.updateBeepCardUserID); 

router.put("/unlink/:UUIC", BeepCardsManagerController.deleteBeepCardUserID); 

export default router;
