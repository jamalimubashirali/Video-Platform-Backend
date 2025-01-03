import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req , res) => {
    const { content , video_id} = req.body;

    if(!(content || video_id)){
        throw new ApiError(
            400,
            "Video with this Id does not exists"
        )
    }

    const user_id = req.user?._id;

    if(!user_id) {
        throw new ApiError(
            400,
            "Unauthorized User"
        )
    }

    const comment = await Comment.create({
        content : content,
        video : video_id,
        owner : user_id
    });

    const createdComment = await Comment.findById(comment._id);

    return res.status(201).json(
        new ApiResponse(
            200,
            createdComment,
            "Comment Added Successfully"
        )
    );
});

const updateComment = asyncHandler(async(req , res) => {
    const comment_id = req.params;
    const {content} = req.body;

    if(!(content , req.params)){
        throw new ApiError(
            400,
            "No matching comment found associated to this id"
        );
    }

    const newComment = await Comment.findByIdAndUpdate(
        comment_id,
        {
            $set : {
                content : content
            }
        },
        {
            new : true
        }
    ).select("-owner -video");

    return res.status(200).json(
        new ApiResponse(
            200,
            newComment,
            "Comment Upated Successfully"
        )
    );
});

const deleteComment = asyncHandler(async (req , res) =>{
    const comment_id = req.params;

    if(!comment_id) {
        throw new ApiError(
            404,
            "Please add a reference to comment"
        )
    }

    const deletedComment = await Comment.findByIdAndDelete(
        comment_id
    );

    if(!deletedComment) {
        throw new ApiError(
            400,
            "Error Deleting Comment"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Comment Deleted Successfully"
        )
    )
})

const getAllComments = asyncHandler(async (req , res) => {

});

export {
    addComment,
    updateComment,
    deleteComment,
    getAllComments
}