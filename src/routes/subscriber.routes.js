import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriberRouter = Router();

// Subscriber Routes
subscriberRouter.use(verifyJWT);


export default subscriberRouter;