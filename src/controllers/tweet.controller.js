import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweets } from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Please add the content");
  }

  const newTweet = await Tweets.create({
    content: content,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet Created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Unauthorized User");
  }

  const userTweets = await Tweets.aggregate([
    {
      $match: {
        owner : new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "users"
      }
    },
    {
      $unwind: "$users"
    },
    {
      $group: {
        _id: "$owner",
        userTweets : {
          $push : {
            fullname : "$users.fullname",
            username : "$users.username",
            avatar : "$users.avatar",
            content : "$content"
          }
        }
      }
    },
    {
      $project: {
        _id : 0,
        userTweets : 1
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Tweets Successfully reterieved"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params;
  const { content } = req.body;

  if (!content || !tweetId) {
    throw new ApiError(400, "Please add the required Field");
  }

  const updatedTweet = await Tweets.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "No tweet found with id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet Successfully Updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Please add the Id");
  }

  const deletedTweet = await Tweets.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(404, "No tweet was found with this id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Sucessfully deleted"));
});

export { updateTweet, getUserTweets, createTweet, deleteTweet };
