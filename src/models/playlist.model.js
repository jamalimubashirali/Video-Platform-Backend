import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        videos : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        name : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
);

export const PlayList = mongoose.model("playlist" , playListSchema);