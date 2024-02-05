import app from "./app";
import env from "./utils/validateENV";
import mongoose from "mongoose";

const PORT = env.PORT;

mongoose.Promise = Promise;

mongoose.connect(env.MONGO_CONNECTION_STRING)
	.then(() => {
		console.log("Mongoose connected");
		app.listen(PORT, () => {
			console.log("Server running on port: " + PORT);
		});
	})
	.catch(console.error);

mongoose.connection.on("error", (error: Error) => { console.log(error); });