import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import session from "express-session";
import { isHttpError } from "http-errors";
import morgan from "morgan";
import adminRoute from "./routes/adminRoute";
import beepCardRoute from "./routes/beepCardsRoute";
import fareRoute from "./routes/fareRoutes";
import stationRoute from "./routes/stationsRoute";
import mrtRoute from "./routes/mrtRoute";
import env from "./utils/validateENV";
import MongoStore from "connect-mongo";
import authenticateToken from "./middleware/authMiddleware"; 

// Set isProduction to true when deploying to Render.com
const isProduction = false;

// Initializing the express app
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Set the origin based on deployment
const corsOptions = {
	origin: isProduction ? env.API_CONNECTION_STRING : ["http://localhost:3000", "http://localhost:3001"],
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	optionsSuccessStatus: 204,
	allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
// Using the dependencies
app.use(express.json());

app.use(session({
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: env.MONGO_CONNECTION_STRING
	}),
	cookie: {
		maxAge: 24 * 60 * 60 * 1000, // Set session duration to 24 hours in milliseconds
	},
}));

// Declaring station API URL
app.use("/api/stations", authenticateToken, stationRoute);
app.use("/api/beepCards", authenticateToken, beepCardRoute);
app.use("/api/fare", authenticateToken, fareRoute);
app.use("/api/admin", adminRoute);
app.use("/api/mrt", mrtRoute);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
	if (error.name === "UnauthorizedError" || error.message === "invalid signature") {
		// Invalid JWT, log out the user by destroying the session
		req.session.destroy(() => {
			res.status(401).send("Unauthorized");
		});
	} else {
		next(error);
	}
});

export default app;