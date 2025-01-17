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
    likedBy: new mongoose.Types.ObjectId(req.user?._id),
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
    likedBy: new mongoose.Types.ObjectId(req.user?._id),
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
    likedBy: new mongoose.Types.ObjectId(req.user?._id),
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

  const numberOfLikes = await Likes.aggregate(
    [
      {
        $match: {
          video : new mongoose.Types.ObjectId(videoId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "likedBy",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $unwind: "$users"
      },
      {
        $group: {
          _id: "$video",
          usersLikedBy : {
            $push : {
              username : "$users.username",
              fullname : "$users.fullname",
              avatar : "$users.avatar"
            }
          }
        }
      },
      {
        $project: {
          _id : 0,
          usersLikedBy : 1
        }
      }
    ]
  )

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes[0]?.usersLikedBy,
        "Video Likes Successfully"
      )
    );
});

const getAllTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Please Provide the Likes for the Video");
  }

  const numberOfLikes = await Likes.aggregate(
    [
      {
        $match: {
          tweet : new mongoose.Types.ObjectId(tweetId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "likedBy",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $unwind: "$users"
      },
      {
        $group: {
          _id: "$video",
          usersLikedBy : {
            $push : {
              username : "$users.username",
              fullname : "$users.fullname",
              avatar : "$users.avatar"
            }
          }
        }
      },
      {
        $project: {
          _id : 0,
          usersLikedBy : 1
        }
      }
    ]
  )

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes[0]?.usersLikedBy,
        "Video Likes Successfully added"
      )
    );
});

const getAllCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Please Provide the Likes for the Video");
  }

  const numberOfLikes = await Likes.aggregate(
    [
      {
        $match: {
          comment : new mongoose.Types.ObjectId(commentId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "likedBy",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $unwind: "$users"
      },
      {
        $group: {
          _id: "$video",
          usersLikedBy : {
            $push : {
              username : "$users.username",
              fullname : "$users.fullname",
              avatar : "$users.avatar"
            }
          }
        }
      },
      {
        $project: {
          _id : 0,
          usersLikedBy : 1
        }
      }
    ]
  )

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        numberOfLikes[0]?.usersLikedBy,
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
