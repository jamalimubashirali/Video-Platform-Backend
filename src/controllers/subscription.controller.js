import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Please Provide the required Id parameter");
  }

  const subscriber = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (!subscriber) {
    const subscriber = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, subscriber, "Subscription Successfully Added to")
      );
  }

  await Subscription.deleteOne({
    _id: subscriber._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscription removed Successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

const getSubscriberdChannels = asyncHandler(async (req, res) => {});

export {
  toggleSubscription,
  getSubscriberdChannels,
  getUserChannelSubscribers,
};
