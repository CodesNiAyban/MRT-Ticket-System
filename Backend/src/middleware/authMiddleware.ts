import jwt, { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { RequestHandler } from "express";
import env from "../utils/validateENV";

const authenticateToken: RequestHandler = async (req, res, next) => {
	const tokenHeader = req.header("Authorization");

	const token = tokenHeader!.replace("Bearer ", "");
	const decodedToken = JSON.parse(atob(token.split(".")[1])) as JwtPayload;

	try {
		jwt.verify(token, env.SESSION_SECRET, (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					return next(createHttpError(401, "Token has expired."));
				} else {
					return next(createHttpError(401, "Invalid token."));
				}
			}

			// Check if the token is issued in the future
			if (decodedToken && decodedToken.iat && decodedToken.iat > Date.now() / 1000) {
				return next(createHttpError(401, "Token issued in the future."));
			}

			// Additional checks based on the decoded information if needed
			if (!decoded) {
				return next(createHttpError(401, "Invalid token payload."));
			}

			// You may perform additional checks based on your requirements
			req.token = decoded;
			next();
		});
	} catch (error) {
		next(createHttpError(401, "Invalid token."));
	}
};

export default authenticateToken;
