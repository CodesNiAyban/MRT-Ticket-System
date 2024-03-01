// server.ts
import server from "./app";
import env from "./utils/validateENV";
import mongoose from "mongoose";

const PORT = env.PORT || 3000; // Use the provided PORT or fallback to a default value

mongoose.Promise = Promise;

mongoose.connect(env.MONGO_CONNECTION_STRING)
	.then(() => {
		console.log("Mongoose connected");
		server.listen(PORT, () => {
			console.log("Server running on port: " + PORT);
		});
	})
	.catch(console.error);

mongoose.connection.on("error", (error: Error) => { console.log(error); });