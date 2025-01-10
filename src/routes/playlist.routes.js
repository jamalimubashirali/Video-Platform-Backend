import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

// Comment Routes
playlistRouter.use(verifyJWT);


export default playlistRouter;