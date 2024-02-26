import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

// Validates ENV if unidentified or empty and would not start server
export default cleanEnv(process.env, {
	API_CONNECTION_STRING: str(),
	MONGO_CONNECTION_STRING: str(),
	SESSION_SECRET: str(),
	PORT: port()
});
