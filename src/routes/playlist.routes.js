import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addVideoToPlaylist, createPlayList, deletePlaylist, getPlaylistById, getUserPlaylists, removePlaylistVideo, updatePlaylist} from "../controllers/playlist.controller.js"

const playlistRouter = Router();

// Comment Routes
playlistRouter.use(verifyJWT);
playlistRouter.post('/new-playlist' , createPlayList);
playlistRouter.patch('/:playlistId' , updatePlaylist);
playlistRouter.delete('/:playlistId' , deletePlaylist);
playlistRouter.get('/:playlistId' , getPlaylistById);
playlistRouter.patch('/remove-video/:playlistId/:videoId' , removePlaylistVideo);
playlistRouter.get('/user-playlist/:userId' , getUserPlaylists);
playlistRouter.patch('/add-video/:playlistId/:videoId' , addVideoToPlaylist);

export default playlistRouter;