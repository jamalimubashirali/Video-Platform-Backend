import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const publishVideo = asyncHandler(async(req , res) => {
    const {description , title} = req.body;

    if(!(description || title)){
        throw new ApiError(
            400,
            "Please provide desc and title"
        );
    }


    const videoFileLocalPath = await req.files?.videoFile[0].path;
    const thumbnailLocalPath = await req.files?.thumbnail[0].path;

    if(!(videoFileLocalPath || thumbnailLocalPath)){
        throw new ApiError(
            400,
            "Please add videoFile and Thumbnail"
        );
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(!videoFile){
        throw new ApiError(
            500,
            "An Error Occured While uploading video on Cloudinary"
        );
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail) {
        throw new ApiError(
            500,
            "An Error Occured While uploading thumnail on Cloudinary"
        );
    }

    const publishedVideo = await Video.create({
        description : description,
        title : title,
        owner : req.user?._id,
        thumbnail : thumbnail?.url,
        videoFile : videoFile?.url,
        duration : videoFile?.duration,
        isPublished : true
    });

    if(!publishedVideo) {
        throw new ApiError(
            500,
            "Error Publishing the saving video in the database"
        )
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            publishedVideo,
            "Video Published Successfully")
    );
});


export {
    publishVideo,
}
