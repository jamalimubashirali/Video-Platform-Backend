import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

// Publish Video Controller
const publishVideo = asyncHandler(async (req, res) => {
  const { description, title } = req.body;

  if (!(description || title)) {
    throw new ApiError(400, "Please provide desc and title");
  }

  const videoFileLocalPath = await req.files?.videoFile[0].path;
  const thumbnailLocalPath = await req.files?.thumbnail[0].path;

  if (!(videoFileLocalPath || thumbnailLocalPath)) {
    throw new ApiError(400, "Please add videoFile and Thumbnail");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new ApiError(
      500,
      "An Error Occured While uploading video on Cloudinary"
    );
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(
      500,
      "An Error Occured While uploading thumnail on Cloudinary"
    );
  }

  const publishedVideo = await Video.create({
    description: description,
    title: title,
    owner: req.user?._id,
    thumbnail: thumbnail?.url,
    videoFile: videoFile?.url,
    duration: videoFile?.duration,
    isPublished: true,
  });

  if (!publishedVideo) {
    throw new ApiError(
      500,
      "Error Publishing the saving video in the database"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, publishedVideo, "Video Published Successfully"));
});

// Get a Video controller
const getVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please Provide a video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(
      404,
      `The Video with the id : ${videoId} was not found in the database`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "The video found successfully"));
});

// Update Video Details controller
const updateVideoDetails = asyncHandler(async (req, res) => {
  const videoId = req.params;
  const updates = req.body;
  if (!videoId) {
    throw new ApiError(400, "Please provide a video Id");
  }

  if (!updates) {
    throw new ApiError(400, "Nothing to update");
  }

  const updateVideo = await Video.findByIdAndUpdate(videoId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updateVideo) {
    throw new ApiError(404, "Video with this Id is not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Updates made successfully"));
});

// Delete Video Controller
const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please Provide a video Id");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    throw new ApiError(404, "The video with this id is not found");
  }

  return res.status(200).json(200, "Video Deleted Successfully");
});

const getAllVideos = asyncHandler(async (req, res) => {});
export {
  getVideo,
  deleteVideo,
  updateVideoDetails,
  publishVideo,
  getAllVideos,
};
