import mongoose, { Schema } from "mongoose";

const commetSchema = new Schema(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        video  :{
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        content : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
);

export const Comment = mongoose.model("Comment" , commetSchema);