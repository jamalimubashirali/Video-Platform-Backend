import mongoose, { model, Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    content : {
        type : String,
    }
  },
  {
    timestamps: true,
  }
);

export const Tweets = mongoose.model("Tweets" , tweetSchema); 
