import {
    getBySeasonEpisode,
    getByName,
    getBySeason,
    getById,
    getByAlbum,
    getByStars,
    getAllService,
    getAllAlbumsService,
    getByUnifiedSearch,
    getAllStarsService,
} from "../services/mediaService.js";

export async function getAll(req, res) {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'timestamp_taken';
        const sortOrder = req.query.sortOrder || 'DESC';
        const result = await getAllService(userId, page, limit, sortBy, sortOrder);
        return res.json(result);
    } catch (err) {
        console.error("Get all media error:", err);
        res.status(500).json({ error: "Failed to get media" });
    }
}

export async function searchBySeason(req, res) {
    try {
        const userId = req.user.id;
        const season = parseInt(req.query.season);
        if (isNaN(season)) {
            return res.status(400).json({ error: "Invalid season" });
        }
        const result = await getBySeason(season, userId);
        return res.json(result);
    } catch (err) {
        console.error("Search season error:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function searchBySeasonEpisode(req, res) {
    try {
        const userId = req.user.id;
        const season = parseInt(req.query.season);
        const episode = parseInt(req.query.episode);

        if (isNaN(season) || isNaN(episode)) {
            return res.status(400).json({ error: "Invalid season or episode" });
        }

        const result = await getBySeasonEpisode(season, episode, userId);
        return res.json(result);
    } catch (err) {
        console.error("Search season/episode error:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function searchByStars(req, res) {
    try {
        const userId = req.user.id;
        let stars = req.query.stars;

        if (!stars) {
            return res.status(400).json({ error: "Tag required" });
        }

        if (!Array.isArray(stars)) {
            stars = [stars];
        }

        const result = await getByStars(stars, userId);
        return res.json(result);
    } catch (err) {
        console.error("Search tag error:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function searchByName(req, res) {
    try {
        const userId = req.user.id;
        const name = req.query.name;
        if (!name) return res.status(400).json({ error: "Name required" });

        const result = await getByName(name, userId);
        return res.json(result);
    } catch (err) {
        console.error("Search name:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function searchById(req, res) {
    try {
        const userId = req.user.id;
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Id required" });

        const result = await getById(id, userId);
        return res.json(result);
    } catch (err) {
        console.error("Search Id:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function searchByAlbum(req, res) {
    try {
        const userId = req.user.id;
        const album = req.query.album;
        if (!album) return res.status(400).json({ error: "album required" });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'timestamp_taken';
        const sortOrder = req.query.sortOrder || 'DESC';

        const result = await getByAlbum(album, userId, page, limit, sortBy, sortOrder);
        return res.json(result);
    } catch (err) {
        console.error("Search album:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function getAllAlbums(req, res) {
    try {
        const userId = req.user.id;
        const result = await getAllAlbumsService(userId);
        return res.json(result);
    } catch (err) {
        console.error("Get all albums error:", err);
        res.status(500).json({ error: "Failed to get albums" });
    }
}

export async function searchUnified(req, res) {
    try {
        const userId = req.user.id;
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: "Query required" });

        const result = await getByUnifiedSearch(query, userId);
        return res.json(result);
    } catch (err) {
        console.error("Unified search error:", err);
        res.status(500).json({ error: "Failed to search" });
    }
}

export async function getAllStars(req, res) {
    try {
        const userId = req.user.id;
        const result = await getAllStarsService(userId);
        return res.json(result);
    } catch (err) {
        console.error("Get all stars error:", err);
        res.status(500).json({ error: "Failed to get stars" });
    }
}
