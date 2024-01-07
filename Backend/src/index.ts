import "dotenv/config";
import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import startServer from "./server";
import env from "./util/validateENV";

//App Varaibles 
dotenv.config();

// Connecting to mongoose
mongoose.connect(env.MONGO_CONNECTION_STRING)
	.then(() => {
		console.log("Mongoose Connected.");
	})
	.catch(console.error);

//Intializing the express app 
const app = express();


//Using the dependancies
app.use(helmet());
app.use(cors());
app.use(express.json());

startServer(app);