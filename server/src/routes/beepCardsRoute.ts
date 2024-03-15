import express from "express";
import * as BeepCardsController from "../controllers/beepCardsController";
import maintenanceAdmin from "../middleware/maintenanceAdmin";

const router = express.Router();

router.get("/", BeepCardsController.getBeepCards);

router.get("/:beepCardId", BeepCardsController.getBeepCard);

router.post("/", BeepCardsController.createBeepCard);

router.patch("/:beepCardId", BeepCardsController.updateBeepCard);

router.delete("/:beepCardId", maintenanceAdmin, BeepCardsController.deleteBeepCard);

export default router;