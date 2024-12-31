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

const router = Router();

// Define the POST route
router.post(
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

router.post("/login", loginUser);

// secure routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", getNewRefreshToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch("/edit-user", verifyJWT, updateUserDetails);

router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

router.get("/:username", verifyJWT, getUserChannelProfile);
router.get("/watch-history", verifyJWT, getWatchHistory);

export default router;
