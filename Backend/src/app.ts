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
import MongoStore from "connect-mongo";
import authenticateToken from "./middleware/authMiddleware"; // Update this with the correct path

// Intializing the express app
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));


app.use(cors({
	origin: "https://mrtonline.onrender.com",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	optionsSuccessStatus: 204,
}));


// // Configure CORS
// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "https://mrtonline.onrender.com/"); // Replace with your frontend URL
// 	res.header("Access-Control-Allow-Credentials", "true");
// 	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
// 	res.header(
// 		"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
// 	);
// 	next();
// });

// Using the dependancies
app.use(express.json());

app.use(session({
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: env.MONGO_CONNECTION_STRING
	}),
	cookie: {
		maxAge: 60 * 3600 * 1000, // Session duration in milliseconds
	},
}));

// Declaring station API URL
app.use("/api/stations", authenticateToken, stationRoute);
app.use("/api/beepCards", authenticateToken, beepCardRoute);
app.use("/api/fare", authenticateToken, fareRoute);
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
