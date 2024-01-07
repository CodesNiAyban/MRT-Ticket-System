import express from "express";
import * as dotenv from "dotenv";
import env from "./util/validateENV";
import stationRoute from "./routes/stationsRoute";

dotenv.config();

const PORT = env.PORT || 4000;

const startServer = (app: express.Express) => {

	app.use("/api/stations", stationRoute);

	app.use(express.json());

	// Error handling middleware
	app.use((req, res, next) => {
		next(Error("Endpoint not found."));
	});
	
	// Listen to the app and run it on PORT
	app.listen(PORT, async () => {
		console.log(`Listening on port ${PORT}`);
	});
};

export default startServer;