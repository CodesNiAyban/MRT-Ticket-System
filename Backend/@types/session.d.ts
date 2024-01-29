import mongoose from "mongoose";

declare module "express-session" {
    interface SessionData {
        adminId: mongoose.Types.ObjectId
    }
}