import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";

// Method for generating Access and Refresh Tokens

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh tokens and Access Tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get the data form Request
  const { fullname, email, username, password } = req.body;

  // Check For empty fields
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields should be filled");
  }

  // Check If user exists in database or not
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Get the uploaded file paths
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath =
    req.files?.coverImage === undefined ? "" : req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "The Avatar image is required");
  }

  // Upload images to Cloud server
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "This field is required");
  }

  // Create user in the database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Check if user is created Successfully in the database or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went while creating user");
  }

  //Send response after completion of the process
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Getting login data from frontend
  const { username, email, password } = req.body;
  // Checking if required fields are present.
  if (!username || !email) {
    throw new ApiError(400, "Username or Password is required");
  }

  // Getting user from the database to ensure it exits
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Throwing error response if user does not exists.
  if (!user) {
    throw new ApiError(404, "User does not exits");
  }

  const isPasswordVaild = await user.isPasswordCorrect(password);

  // Checking Password

  if (!isPasswordVaild) {
    throw new ApiError(400, "The password is Incorrect");
  }

  // Generataing refresh and Access Token

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Parameter for cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Successfully"));
});

// Method to create newRefresh Token
const getNewRefreshToken = asyncHandler(async (req, res) => {
  try {
    const oldRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    // Checking existance of Old refresh Token
    if (!oldRefreshToken) {
      throw new ApiError(401, "Unauthorized User");
    }

    // Verifying old refresh token with secret key to ensure that is same
    const verifedToken = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // If not verified throwing Error to ensure the falsity of the statement
    if (!verifedToken) {
      throw new ApiError(401, "Unauthorized Access");
    }

    const user = await User.findById(verifedToken._id);

    // If checking if user exists in database or not.
    if (!user) {
      throw new ApiError(404, "No Identity found with this id");
    }

    // comparing given Refresh token and refresh token stored at the user side to ensure they are same
    if (oldRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Expired Token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generating all new user token if all checks are successful
    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      "Something went wrong during generating new refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req?.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invaild Old Password");
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await req?.user;

  if (!currentUser) {
    throw new ApiError(404, "User was not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, currentUser, "Current User Available"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All field are required");
  }

  const newUser = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, newUser, "Details changed successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "File is Missing please add file");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    new ApiError(400, "Error while uploading on avatar");
  }

  const newUser = await User.findById(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-passowrd -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, newUser, "Avatar Changed Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "File is Missing please add file");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    new ApiError(400, "Error while uploading on coverImage");
  }

  const newUser = await User.findById(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-passowrd -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, newUser, "Cover Image Changed Successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(404, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed_to",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribed_to",
        },
        isSubscribed: {
          $condition: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel Does not Exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel Fetched"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched Successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getNewRefreshToken,
  getCurrentUser,
  changeCurrentPassword,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
