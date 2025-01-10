import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likesRouter = Router();

// Likes Routes
likesRouter.use(verifyJWT);


export default likesRouter;