import { Router } from "express";
import { getNewRefreshToken, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Define the POST route
router.post('/register', (req, res, next) => {
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message }); // Multer-specific errors
        } else if (err) {
            return res.status(500).json({ error: err.message }); // General errors
        }
        next();
    });
}, registerUser);


router.post("/login" , loginUser);

// secure routes
router.post('/logout' , verifyJWT , logoutUser);
router.post("/refresh-token" , getNewRefreshToken);

export default router;
