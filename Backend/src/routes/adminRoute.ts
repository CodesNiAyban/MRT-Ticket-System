import express from "express";
import * as AdminController from "../controllers/adminController";

const router = express.Router();

router.get("/", AdminController.getAuthenticatedAdmin);

router.post("/create", AdminController.createAdmin);

// Modify the login route
router.post("/login", AdminController.login);

// Modify the logout route
router.post("/logout", AdminController.logout);

export default router;
