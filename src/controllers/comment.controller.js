import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  console.log(content);
  if (!(content || videoId)) {
    throw new ApiError(400, "Video with this Id does not exists");
  }

  const user_id = req.user?._id;

  if (!user_id) {
    throw new ApiError(400, "Unauthorized User");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: user_id,
  });

  const createdComment = await Comment.findById(comment._id);

  return res
    .status(201)
    .json(new ApiResponse(200, createdComment, "Comment Added Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!(content, req.params)) {
    throw new ApiError(400, "No matching comment found associated to this id");
  }

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  ).select("-owner -video");

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment Upated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(404, "Please add a reference to comment");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(400, "Error Deleting Comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment Deleted Successfully"));
});

const getAllComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Unalble to get the comments");
  }

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId("678236405c99d1d19dcecc68"),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: "$video",
        userComments: {
          $push: {
            username: "$user.username",
            avatar: "$user.avatar",
            content: "$content",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        userComments: 1,
      },
    },
  ]);

  if (allComments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No comments associated to this video"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allComments,
        "Successfully fetched the comments assocaited to this video"
      )
    );
});

export { addComment, updateComment, deleteComment, getAllComments };
