import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getNewRefreshToken,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Define the POST route
userRouter.post(
  "/register",
  (req, res, next) => {
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ])(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message }); // Multer-specific errors
      } else if (err) {
        return res.status(500).json({ error: err.message }); // General errors
      }
      next();
    });
  },
  registerUser
);

userRouter.post("/login", loginUser);

// secure routes
userRouter.post("/logout", verifyJWT, logoutUser);
userRouter.post("/refresh-token", getNewRefreshToken);
userRouter.post("/change-password", verifyJWT, changeCurrentPassword);
userRouter.get("/current-user", verifyJWT, getCurrentUser);
userRouter.patch("/edit-user", verifyJWT, updateUserDetails);
userRouter.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
userRouter.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);
userRouter.get("/:username", verifyJWT, getUserChannelProfile);
userRouter.get("/watch-history", verifyJWT, getWatchHistory);

export default userRouter;
