// express.d.ts
declare namespace Express {
    interface Request {
        token?: unknown; // Change 'any' to the actual type of your admin object
    }
}