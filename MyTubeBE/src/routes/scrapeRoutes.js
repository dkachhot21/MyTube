import express from "express";
import { scrape } from "../controllers/scrapeController.js";

const router = express.Router();

router.post("/scrape", scrape);

export default router;
