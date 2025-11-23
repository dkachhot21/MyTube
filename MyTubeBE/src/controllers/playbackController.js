import {
    savePlaybackPosition as savePosition,
    getPlaybackPosition as getPosition,
    getPlaybackHistory as getHistory,
    getContinueWatching as getContinue,
    deletePlaybackHistory as deleteHistory
} from '../repositories/playbackRepository.js';
import fs from 'fs';
import path from 'path';

// Save playback position
export async function savePlaybackPosition(req, res) {
    try {
        const { mediaId, position, headers } = req.body;
        const userId = req.user.id;
        console.log(`[Playback] Saving position for user ${userId}, media ${mediaId}, pos ${position}`);

        if (!mediaId || position === undefined) {
            return res.status(400).json({ error: 'mediaId and position are required' });
        }

        const result = await savePosition(userId, mediaId, position, headers || {});

        res.json({
            message: 'Playback position saved',
            data: result
        });
    } catch (error) {
        console.error('Save playback position error:', error);
        res.status(500).json({ error: 'Failed to save playback position' });
    }
}

// Get playback position for specific media
export async function getPlaybackPosition(req, res) {
    try {
        const { mediaId } = req.params;
        const userId = req.user.id;

        const result = await getPosition(userId, mediaId);

        if (!result) {
            return res.json({ position: 0, headers: {} });
        }

        res.json({
            position: result.playback_position,
            headers: result.playback_headers,
            last_watched: result.last_watched
        });
    } catch (error) {
        console.error('Get playback position error:', error);
        res.status(500).json({ error: 'Failed to get playback position' });
    }
}

// Get playback history
export async function getPlaybackHistory(req, res) {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        console.log(`[Playback] Getting history for user ${userId}`);
        const logPath = path.join(process.cwd(), 'src', 'logs.txt');
        try { fs.appendFileSync(logPath, `[Controller] Getting history for ${userId}\n`); } catch (e) { }

        const history = await getHistory(userId, limit);

        res.json(history);
    } catch (error) {
        console.error('Get playback history error:', error);
        res.status(500).json({ error: 'Failed to get playback history' });
    }
}

// Get continue watching
export async function getContinueWatching(req, res) {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const videos = await getContinue(userId, limit);

        res.json(videos);
    } catch (error) {
        console.error('Get continue watching error:', error);
        res.status(500).json({ error: 'Failed to get continue watching' });
    }
}

// Delete playback history
export async function deletePlaybackHistory(req, res) {
    try {
        const { mediaId } = req.params;
        const userId = req.user.id;

        await deleteHistory(userId, mediaId);

        res.json({ message: 'Playback history deleted' });
    } catch (error) {
        console.error('Delete playback history error:', error);
        res.status(500).json({ error: 'Failed to delete playback history' });
    }
}

// Clear all playback history for user
export async function clearAllHistory(req, res) {
    try {
        const userId = req.user.id;

        await deleteHistory(userId, null);

        res.json({ message: 'All playback history cleared' });
    } catch (error) {
        console.error('Clear all history error:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
}
