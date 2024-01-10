import express from "express";
import * as BeepCardsController from "../controllers/beepCardsController";
import { isAuthenticated, isOwner } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", BeepCardsController.getBeepCards);

router.get("/:beepCardId", BeepCardsController.getBeepCards);

router.post("/", BeepCardsController.createBeepCard);

router.patch("/:beepCardId", BeepCardsController.updateBeepCard);

router.delete("/:beepCardId", isAuthenticated, isOwner, BeepCardsController.deleteBeepCard);

export default router;