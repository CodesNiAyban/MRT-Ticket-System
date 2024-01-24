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
import env from "./utils/validateENV";
// import { verify, JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
// import MongoStore from "connect-mongo";

// Intializing the express app
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(cors({
	origin: "http://localhost:3000", // Replace with your frontend URL
	credentials: true,
}));

// Configure CORS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your frontend URL
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	next();
});

// Using the dependancies
app.use(express.json());

// app.use((req, res, next) => {
// 	const token = req.session.token;

// 	if (!token) {
// 		// Handle the case where the token is undefined
// 		req.session.destroy(() => {
// 			res.status(401).send("Unauthorized");
// 		});
// 	} else {
// 		verify(token, env.SESSION_SECRET, (err: JsonWebTokenError | NotBeforeError | TokenExpiredError | null) => {
// 			if (err) {
// 				// Handle invalid token
// 				req.session.destroy(() => {
// 					res.status(401).send("Unauthorized");
// 				});
// 			} else {
// 				// Token is valid, proceed with the next middleware
// 				// If needed, you can use the 'decoded' payload here
// 				next();
// 			}
// 		});
// 	}
// });

app.use(session({
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new session.MemoryStore(), // Use MemoryStore for local storage
	cookie: {
		maxAge: 60 * 60 * 1000, // Session duration in milliseconds
	},
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
