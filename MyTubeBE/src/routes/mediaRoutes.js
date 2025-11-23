import express from "express";
import {
  searchBySeasonEpisode,
  searchByName,
  searchBySeason,
  searchByStars,
  searchById,
  searchByAlbum,
  getAll,
  getAllAlbums,
  searchUnified,
  getAllStars,
} from "../controllers/mediaController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All media routes require authentication
router.get("/", authMiddleware, getAll);
router.get("/search", authMiddleware, searchUnified);                         // ?q=query
router.get("/search/season", authMiddleware, searchBySeason);                 // ?season=1
router.get("/search/season-episode", authMiddleware, searchBySeasonEpisode);   // ?season=1&episode=2
router.get("/search/stars", authMiddleware, searchByStars);                     // ?tag=Tag1
router.get("/search/name", authMiddleware, searchByName);                     // ?name=Title
router.get("/search/id", authMiddleware, searchById);                         // ?id=InternalID
router.get("/search/album", authMiddleware, searchByAlbum);                     // ?album=AlbumName
router.get("/albums", authMiddleware, getAllAlbums);
router.get("/stars", authMiddleware, getAllStars);

export default router;
