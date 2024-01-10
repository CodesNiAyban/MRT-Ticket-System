import express from "express";
import { login } from "../controllers/authenticationController";
import { register } from "../controllers/adminController";
// import { isAuthenticated } from "../middlewares/adminMiddleware";
import { getAllAdmins, deleteAdmin, updateAdmin } from "../controllers/adminController";
import { isAuthenticated } from "../middlewares/adminMiddleware";

const router = express.Router();

router.post("/login", login);

router.post("/create", register);

router.get("/admins", isAuthenticated, getAllAdmins);

router.delete("/admins/:id", deleteAdmin);

router.patch("/admins/:id", updateAdmin);

export default router;