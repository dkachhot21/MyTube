import { db } from "../db/index.js";
import fs from 'fs';
import path from 'path';

// Save or update playback position
export async function savePlaybackPosition(userId, mediaId, position, headers) {
    console.log(`[Repo] Saving playback: user=${userId}, media=${mediaId}`);
    const result = await db.query(
        `INSERT INTO playback_history (user_id, media_id, playback_position, playback_headers, last_watched)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, media_id)
     DO UPDATE SET
       playback_position = $3,
       playback_headers = $4,
       last_watched = NOW()
     RETURNING *`,
        [userId, mediaId, position, JSON.stringify(headers)]
    );

    return result.rows[0];
}

// Get playback position for specific media
export async function getPlaybackPosition(userId, mediaId) {
    const result = await db.query(
        `SELECT * FROM playback_history
     WHERE user_id = $1 AND media_id = $2`,
        [userId, mediaId]
    );

    return result.rows[0];
}

// Get user's playback history
export async function getPlaybackHistory(userId, limit = 50) {
    const logPath = path.join(process.cwd(), 'src', 'logs.txt');
    try { fs.appendFileSync(logPath, `[Repo] Fetching history for ${userId}\n`); } catch (e) { }

    try {
        const result = await db.query(
            `SELECT ph.*, 
                m.title, 
                m.file_name, 
                m.duration_ms, 
                m.url, 
                a.album_name, 
                m.timestamp_taken
         FROM playback_history ph
         LEFT JOIN media m ON ph.media_id = m.internal_id AND m.user_id = ph.user_id
         LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = ph.user_id
         WHERE ph.user_id = $1
         ORDER BY ph.last_watched DESC
         LIMIT $2`,
            [userId, limit]
        );

        try { fs.appendFileSync(logPath, `[Repo] Result count: ${result.rows.length}\n`); } catch (e) { }
        return result.rows;
    } catch (err) {
        try { fs.appendFileSync(logPath, `[Repo] Error: ${err.message}\n`); } catch (e) { }
        throw err;
    }
}

// Get continue watching (videos with progress but not finished)
export async function getContinueWatching(userId, limit = 20) {
    const result = await db.query(
        `SELECT ph.*, m.title, m.file_name, m.duration_ms, m.url, m.timestamp_taken
     FROM playback_history ph
     JOIN media m ON ph.media_id = m.internal_id AND m.user_id = ph.user_id
     WHERE ph.user_id = $1
       AND ph.playback_position > 0
       AND ph.playback_position < (m.duration_ms / 1000 * 0.95)
       AND ph.last_watched > NOW() - INTERVAL '30 days'
     ORDER BY ph.last_watched DESC
     LIMIT $2`,
        [userId, limit]
    );

    return result.rows;
}

// Delete old playback history (older than 30 days)
export async function cleanupOldHistory() {
    const result = await db.query(
        `DELETE FROM playback_history
     WHERE last_watched < NOW() - INTERVAL '30 days'
     RETURNING id`
    );

    return result.rowCount;
}

// Delete playback history for specific media or all history
export async function deletePlaybackHistory(userId, mediaId) {
    if (mediaId) {
        // Delete specific media history
        await db.query(
            `DELETE FROM playback_history
         WHERE user_id = $1 AND media_id = $2`,
            [userId, mediaId]
        );
    } else {
        // Delete all history for user
        await db.query(
            `DELETE FROM playback_history
         WHERE user_id = $1`,
            [userId]
        );
    }
}
