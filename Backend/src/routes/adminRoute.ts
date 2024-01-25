import express from "express";
import * as AdminController from "../controllers/adminController";
import authenticateToken from "../middleware/authMiddleware"; // Update this with the correct path

const router = express.Router();

router.get("/", authenticateToken, AdminController.getAuthenticatedAdmin);

router.post("/create", AdminController.createAdmin);

router.post("/login", AdminController.login);

router.post("/logout", AdminController.logout);

export default router;
