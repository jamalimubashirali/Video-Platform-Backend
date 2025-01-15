import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const tweetRouter = Router();

// Tweets Routes
tweetRouter.use(verifyJWT);
tweetRouter.post("/new-tweet", createTweet);
tweetRouter.get("/:userId", getUserTweets);
tweetRouter.patch("/:tweetId", updateTweet);
tweetRouter.delete("/:tweetId", deleteTweet);

export default tweetRouter;
