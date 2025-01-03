import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

commetSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment" , commetSchema);