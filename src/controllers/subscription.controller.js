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

  if (!channelId) {
    throw new ApiError(400, "Pleae Add the required id");
  }

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "User",
        foreignField: "_id",
        localField: "subscriber",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        userSubscribers: {
          $size: "$subscribers",
        },
        name: "$subscribers.firstname",
        username: "$subscriber.username",
        avatar: "$subscribers.avatar",
      },
    },
    {
      $project: {
        userSubscribers: 1,
        name: 1,
        username: 1,
        avatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userChannelSubscribers,
        "Successfully reterived channel Subscribers"
      )
    );
});

const getSubscriberdChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Please Provide the given parameter id");
  }

  const userSubscriberedChannles = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "User",
        foreignField: "_id",
        localField: "channel",
        as: "subscribedChannels",
      },
    },
    {
      $addFields: {
        name: "$subscribedChannels.fullname",
        avatar: "$subscribedChannels.avatar",
        username: "$subscribedChannels.username",
      },
    },
    {
      $project: {
        name: 1,
        avatar: 1,
        username: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userSubscriberedChannles,
        "Successfully reterived User Subscribed Channels"
      )
    );
});

export {
  toggleSubscription,
  getSubscriberdChannels,
  getUserChannelSubscribers,
};
