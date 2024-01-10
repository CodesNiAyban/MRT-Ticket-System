import crypto from "crypto";
import env from "../utils/validateENV";


const SESSION_SECRET = env.SESSION_SECRET;

export const authentication = (salt: string, password: string): string => {
	return crypto.createHmac("sha256", [salt, password].join("/")).update(SESSION_SECRET).digest("hex");
};

export const random = () => crypto.randomBytes(128).toString("base64");