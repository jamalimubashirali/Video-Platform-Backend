import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Method for generating Access and Refresh Tokens

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ValidateBeforeSave : false});
        return {accessToken , refreshToken};

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating refresh tokens and Access Tokens")
    }
}



const registerUser = asyncHandler(async (req, res) => {
 
    // Get the data form Request
    const {fullname , email , username, password} = req.body;
    
    // Check For empty fields
    if([fullname , email , password , username].some((field) => field?.trim() === "" )){
        throw new ApiError(400 , "All fields should be filled") ;
    }

    // Check If user exists in database or not
    const existedUser = await User.findOne({
        $or : [{email} , {username}]
    });

    if(existedUser) {
        throw new ApiError(409 , "User already exists");
    }

    // Get the uploaded file paths
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage === undefined ? "" : req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError (400 , "The Avatar image is required");
    }

    // Upload images to Cloud server
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400 , "This field is required");
    }

    // Create user in the database
    const user = await User.create({
        fullname, 
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    });

    // Check if user is created Successfully in the database or not
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500 , "Something went while creating user");
    }

    //Send response after completion of the process
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registered Successfully")
    );
});

const loginUser = asyncHandler(async (req , res) => {

    // Getting login data from frontend 
    const {username , email , password} = req.body;
    // Checking if required fields are present.
    if (!username || !email) {
        throw new ApiError(400 ,  "Username or Password is required");
    }

    // Getting user from the database to ensure it exits
    const user = await User.findOne({
        $or  : [{username} , {email}]
    });

    // Throwing error response if user does not exists.
    if (!user) {
        throw new ApiError(404 , "User does not exits");
    }

    const isPasswordVaild = await user.isPasswordCorrect(password);

    // Checking Password

    if(!isPasswordVaild) {
        throw new ApiError(400 , "The password is Incorrect");
    }

    // Generataing refresh and Access Token

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    // Parameter for cookie
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , {
                user : loggedInUser,
                accessToken, 
                refreshToken
            },
            "User Logged In Successfully"
        )
    );
});

const logoutUser = asyncHandler (async (req , res) => {
    await User.findByIdAndUpdate(req.user._id , {
        $set : {
            refreshToken : undefined
        }
    },
    {
        new : true
    });

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logged out Successfully"
        )
    );
})

const getNewRefreshToken = asyncHandler(async (req , res) => {
    try {
        const oldRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    
        if(!oldRefreshToken) {
            throw new ApiError(401 , "Unauthorized User");
        }
    
        const verifedToken = jwt.verify(oldRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        if(!verifedToken) {
            throw new ApiError(401 , "Unauthorized Access");
        }
    
        const user = await User.findById(verifedToken._id);
    
        if(!user) {
            throw new ApiError(404 , "No Identity found with this id");
        }
    
        if(oldRefreshToken !== user?.refreshToken) {
            throw new ApiError(401 , "Expired Token");
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {refreshToken , accessToken} = await generateAccessAndRefreshTokens(user._id);
    
        res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(200 , 
                {
                    accessToken,
                    refreshToken,
                },
                "Access Token refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400 , "Something went wrong during generating new refresh token");   
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getNewRefreshToken
}

