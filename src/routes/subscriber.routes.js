import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getSubscriberdChannels, getUserChannelSubscribers, toggleSubscription} from "../controllers/subscription.controller.js"

const subscriberRouter = Router();

// Subscriber Routes
subscriberRouter.use(verifyJWT);
subscriberRouter.post('/toggle-subscription/:channelId' , toggleSubscription);
subscriberRouter.get('/subscribers/:channelId' , getUserChannelSubscribers);
subscriberRouter.get('/subscribed-channels/:subscriberId' , getSubscriberdChannels);

export default subscriberRouter;