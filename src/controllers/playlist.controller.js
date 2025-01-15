import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PlayList } from "../models/playlist.model.js";

const createPlayList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name || description)) {
    throw new ApiError(400, "Please Add require fields");
  }

  const newPlaylist = await PlayList.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newPlaylist, "New PlayList Successfully Created")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Please provide playlist id");
  }

  const dlePlaylist = await PlayList.findByIdAndDelete(playlistId);

  if (!dlePlaylist) {
    throw new ApiError(404, "No playlist found with this id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "PlayList Successfully deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const updateData = req.body;
  if (!updateData) {
    throw new ApiError(400, "Please provide updated data");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "The playlist not found with id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist Updated Successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Add user params");
  }

  const userPlaylist = await PlayList.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!userPlaylist) {
    throw new ApiError(404, "The user not found with this Id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "Successfully fetched the userPlaylists."
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Please provide the playlist id");
  }

  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "No Playlist was found with this id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Successfully reterived the playlist.")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId || videoId)) {
    throw new ApiError(400, "Please provide the required params");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "No playlist found with this Id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added Successfully to playlist."
      )
    );
});

const removePlaylistVideo = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId || videoId)) {
    throw new ApiError(400, "Please provide the required fields");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedPlaylist,
      "Video Successfully removed from the playlist"
    )
  )
});

export {
  createPlayList,
  deletePlaylist,
  updatePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removePlaylistVideo,
};
