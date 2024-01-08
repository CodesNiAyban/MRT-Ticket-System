import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import stationRoute from "./routes/stationsRoute";
import createHttpError, { isHttpError } from "http-errors";
import morgan from "morgan";

//Intializing the express app 
const app = express();

app.use(morgan("dev"));

//Using the dependancies
app.use(express.json());

//Declaring station API URL
app.use("/api/stations", stationRoute);

// Error handling middleware
app.use((req, res, next) => {
	next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
	console.error(error);
	let errorMessage = "An unknown error occurred";
	let statusCode = 500;
	if (isHttpError(error)) {
		statusCode = error.status;
		errorMessage = error.message;
	}
	res.status(statusCode).json({ error: errorMessage });
});

export default app;