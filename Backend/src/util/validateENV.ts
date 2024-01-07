import { cleanEnv } from "envalid";
import { port,str } from "envalid/dist/validators";

// Validates ENV if unidentified or empty and would not start server
export default cleanEnv(process.env, {
	MONGO_CONNECTION_STRING: str(),
	PORT: port(),
});