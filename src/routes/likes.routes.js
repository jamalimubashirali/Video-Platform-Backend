import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllCommentLikes, getAllTweetLikes, getAllVideoLikes, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

const likesRouter = Router();

// Likes Routes
likesRouter.use(verifyJWT);
likesRouter.post('/toggle-video-like/:videoId' , toggleVideoLike);
likesRouter.post('/toggle-comment-like/:commentId' , toggleCommentLike);
likesRouter.post('/toggle-tweet-like/:tweetId' , toggleTweetLike);
likesRouter.get('/video-likes/:videoId' , getAllVideoLikes);
likesRouter.get('/comment-likes/:commentId' , getAllCommentLikes);
likesRouter.get('/tweet-likes/:tweetId' , getAllTweetLikes);


export default likesRouter;