import { scrapeAlbum } from "../services/scrapeService.js";

export async function scrape(req, res) {
    try {
        const userId = req.user.id;
        const list = req.body;

        if (!list) return res.status(400).json({ error: "Missing URL" });
        if (!Array.isArray(list))
            return res.status(400).json({ error: "URL must be an array" });

        list.forEach(async (obj) => {
            scrapeAlbum(obj, userId);
        });

        res.json({
            message: "Scrape is processing in BG, please check back later",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
