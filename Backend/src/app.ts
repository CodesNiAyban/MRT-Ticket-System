import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
// import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import stationRoute from "./routes/stationsRoute";
import beepCardRoute from "./routes/beepCardsRoute";
import fareRoute from "./routes/fareRoutes";
import { isHttpError } from "http-errors";
import morgan from "morgan";
import adminRoute from "./routes/adminRoute";
import env from "./utils/validateENV";
import session from "express-session";
import MongoStore from "connect-mongo";


// Intializing the express app
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));
// app.use(cors({ credentials: true }));

// Using the dependancies
app.use(express.json());

app.use(session({
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 60 * 60 * 1000
	},
	rolling: true,
	store: MongoStore.create({
		mongoUrl: env.MONGO_CONNECTION_STRING
	})
}));

// Declaring station API URL
app.use("/api/stations", stationRoute);
app.use("/api/beepCards", beepCardRoute);
app.use("/api/fare", fareRoute);
app.use("/api/admin", adminRoute);

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