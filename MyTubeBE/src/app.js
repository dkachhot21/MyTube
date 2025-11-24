import express from "express";
import scrapeRoutes from "./routes/scrapeRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import playbackRoutes from "./routes/playbackRoutes.js";
import scrapeConfigRoutes from "./routes/scrapeConfigRoutes.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { initDb } from "./db/init.js";
import cors from "cors";
import { fetchById } from "./repositories/mediaRepository.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://dkachhot21.github.io'],
    credentials: true,
    exposedHeaders: ['Authorization']
}));

// Public routes
app.use("/auth", authRoutes);

// Protected routes
app.use("/api/scrape-config", scrapeConfigRoutes);
app.use("/api", authMiddleware, scrapeRoutes);
app.use("/media", mediaRoutes); // Already has auth middleware in routes
app.use("/playback", playbackRoutes); // Already has auth middleware in routes

// Stream endpoint (requires authentication)
app.get("/stream", authMiddleware, async (req, res) => {
    const id = req.query.id;
    const quality = req.query.quality || "1080p";
    const range = req.headers.range;
    const userId = req.user.id;

    const videoObj = await fetchById(id, userId);

    if (!videoObj) {
        return res.status(404).json({ error: "Video not found" });
    }

    // --- 1. Construct External URL ---
    const baseUrl = videoObj.url;
    let modifier = "=m37";
    if (quality === "4k") modifier = "=dv";
    if (quality === "1080p") modifier = "=m37";
    if (quality === "720p") modifier = "=m22";
    if (quality === "360p") modifier = "=m18";

    const externalStreamUrl = `${baseUrl}${modifier}`;

    try {
        // --- 2. Determine Request Headers for External Source ---
        const fetchHeaders = {
            redirect: "follow",
            headers: range ? { Range: range } : {},
        };

        // --- 3. Fetch the Stream (Full or Partial) ---
        const response = await fetch(externalStreamUrl, fetchHeaders);

        if (!response.ok) {
            return res
                .status(response.status)
                .send(
                    `Failed to fetch external stream: ${response.statusText}`
                );
        }

        // --- 4. Copy Headers and Set CORS/Ranges ---
        const contentType = response.headers.get("content-type") || "video/mp4";
        const contentLength = response.headers.get("content-length");
        const acceptRanges = response.headers.get("accept-ranges") || "bytes";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Accept-Ranges", acceptRanges);
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

        // --- 5. Handle Range Request (The Seeking Logic) ---
        if (range) {
            const contentRange = response.headers.get("content-range");

            if (response.status === 206 && contentRange) {
                res.status(206);
                res.setHeader("Content-Range", contentRange);
                const partialLength = response.headers.get("content-length");
                if (partialLength) {
                    res.setHeader("Content-Length", partialLength);
                }
            } else {
                console.warn(
                    "External source ignored Range request. Serving full stream."
                );
                res.setHeader("Content-Length", contentLength);
            }
        } else {
            if (contentLength) {
                res.setHeader("Content-Length", contentLength);
            }
        }

        // --- 6. Pipe the Stream ---
        response.body.pipe(res);
    } catch (error) {
        console.error("Streaming proxy error:", error);
        res.status(500).send("Internal server error during streaming.");
    }
});

async function start() {
    await initDb();

    // Clean up old playback history on server start
    try {
        const { cleanupOldHistory } = await import('./repositories/playbackRepository.js');
        const deletedCount = await cleanupOldHistory();
        console.log(`🧹 Cleaned up ${deletedCount} old playback history records`);
    } catch (error) {
        console.error('Error cleaning up old history:', error);
    }

    app.listen(process.env.PORT || 8999, () => {
        console.log("✅ Server running on port", process.env.PORT || 8999);
        console.log("🔐 JWT Authentication enabled");
        console.log("📡 CORS configured for http://localhost:3000");
    });
}

start();
