import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = new Router();

// Comment Routes
commentRouter.use(verifyJWT);

export default commentRouter;
