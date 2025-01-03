import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { publishVideo } from "../controllers/video.controller.js";

const videorRouter = Router();

videorRouter.post('/publish-video' , verifyJWT, upload.fields([
    {
        name : "videoFile",
        maxCount : 1
    },
    {
        name : "thumbnail",
        maxCount  : 1
    }
]) , publishVideo);


export default videorRouter;

