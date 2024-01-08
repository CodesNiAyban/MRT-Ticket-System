import app from "./app";
import env from "./util/validateENV";
import mongoose from "mongoose";

const PORT = env.PORT || 5000;

mongoose.connect(env.MONGO_CONNECTION_STRING)
	.then(() => {
		console.log("Mongoose connected");
		app.listen(PORT, () => {
			console.log("Server running on port: " + PORT);
		});
	})
	.catch(console.error);