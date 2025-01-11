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
        channel: new mongoose.Types.ObjectId("6762a8fb7438dea6b21eadec"),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $group: {
        _id: "$channel",
        subscribers: {
          $push: {
            username: "$subscribers.username",
            fullname: "$subscribers.fullname",
            avatar: "$subscribers.avatar",
          },
        },
        subscriberCount: { $sum: 1 }, // Counts the number of subscribers
      },
    },
    {
      $project: {
        _id: 0, // Exclude the group ID field
        subscribers: 1,
        subscriberCount: 1,
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
      subscriber : new mongoose.Types.ObjectId(subscriberId)
    }
    },
     {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels"
      } 
    },
    {
      $unwind: "$channels"
    },
    {
      $group: {
        _id: "$channel",
        subscribedChannels : {
          $push : {
            username : "$channels.username",
            fullname : "$channels.fullname",
            avatar : "$channels.avatar"
          }
        }
      }
    },
    {
      $project : {
        _id : 0,
        subscribedChannels : 1
      }
    }
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
