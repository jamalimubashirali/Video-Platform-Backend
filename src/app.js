import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandling.middleware.js";

// Routes Declaration
app.use('/api/v1/users', userRouter);

app.use(errorHandler)

export { app };