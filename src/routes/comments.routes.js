import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";

const commentRouter = new Router();

// Comment Routes
commentRouter.use(verifyJWT);
commentRouter.post('/:videoId' , addComment);
commentRouter.patch('/:commentId' , updateComment);
commentRouter.delete('/:commentId' , deleteComment);
commentRouter.get('/video-comments/:videoId' , getAllComments);

export default commentRouter;
