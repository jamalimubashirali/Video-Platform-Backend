import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Likes } from "../models/likes.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please include id for request");
  }

  const existingLike = await Likes.findOne({
    video: new mongoose.Types.ObjectId(videoId),
  });

  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Like removed from the video"));
  }

  const newLike = await Likes.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "User Liked video"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Please Add Comment Id");
  }

  const existingLike = await Likes.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
  });

  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Like removed from the comment"));
  }

  const newLike = await Likes.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res.status(201).json(new ApiResponse(201, newLike, "Comment liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Please add tweet Id");
  }

  const existingLike = await Likes.findOne({
    tweet: new mongoose.Types.ObjectId(tweetId),
  });

  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Like removed from the tweet"));
  }

  const newLike = await Likes.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Like added to Tweet"));
});

const getAllVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please Provide the Likes for the Video");
  }

  const numberOfLikes = await Likes.find({
    video: new mongoose.Types.ObjectId(videoId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes.length,
        "Video Likes Successfully added"
      )
    );
});

const getAllTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Please Provide the Likes for the Video");
  }

  const numberOfLikes = await Likes.find({
    tweet: new mongoose.Types.ObjectId(tweetId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes.length,
        "Video Likes Successfully added"
      )
    );
});

const getAllCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Please Provide the Likes for the Video");
  }

  const numberOfLikes = await Likes.find({
    comment: new mongoose.Types.ObjectId(commentId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes.length,
        "Video Likes Successfully added"
      )
    );
});

export {
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getAllCommentLikes,
  getAllVideoLikes,
  getAllTweetLikes,
};
