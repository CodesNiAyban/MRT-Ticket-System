import express from "express";
import * as AdminController from "../controllers/adminController";

const router = express.Router();

router.get("/", AdminController.getAuthenticatedAdmin);

router.post("/create", AdminController.createAdmin);

router.post("/login", AdminController.login);

router.post("/logout", AdminController.logout);

export default router;