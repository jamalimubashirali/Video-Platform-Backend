import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { deleteVideo, getAllVideos, getVideo, publishVideo, updateVideoDetails } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.post('/publish-video' , verifyJWT, upload.fields([
    {
        name : "videoFile",
        maxCount : 1
    },
    {
        name : "thumbnail",
        maxCount  : 1
    }
]) , publishVideo);

videoRouter.get('/:videoId' , verifyJWT ,  getVideo);
videoRouter.patch('/:videoId' , verifyJWT , updateVideoDetails);
videoRouter.delete('/:videoid' , verifyJWT , deleteVideo);
videoRouter.get('/' , verifyJWT, getAllVideos);


export default videoRouter;

