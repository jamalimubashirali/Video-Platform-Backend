import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

// Tweets Routes
tweetRouter.use(verifyJWT);

export default tweetRouter;