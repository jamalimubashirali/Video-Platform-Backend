import mongoose from "mongoose";
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {PlayList} from "../models/playlist.model.js"

const createPlayList = asyncHandler(async (req , res)=> {
    const {name , description} = req.body;

    if(!(name || description)){
        throw new ApiError(
            400,
            "Please Add require fields"
        );
    }

    const newPlaylist = await PlayList.create(
        {
            name: name,
            description: description,
            owner: req.user?._id
        }
    );

    return res.status(201).json(
        new ApiResponse(
            201,
        newPlaylist,
        "New PlayList Successfully Created"
        )
    );
});

const deletePlaylist = asyncHandler(async(req , res) => {
    const {playlistId} = req.params;

    if(!playlistId){
        throw new ApiError(
            400,
            "Please provide playlist id"
        );
    }

    const dlePlaylist = await PlayList.findByIdAndDelete(playlistId);

    if(!dlePlaylist){
        throw new ApiError(
            404,
            "No playlist found with this id"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "PlayList Successfully deleted"
        )
    );
});


export {
    createPlayList,
    deletePlaylist
}
