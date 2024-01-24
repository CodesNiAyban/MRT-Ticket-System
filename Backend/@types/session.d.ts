import mongoose from "mongoose";

declare module "express-session" {
    interface SessionData {
        adminId: mongoose.Types.ObjectId | null;
        token: string | null;
    }
}