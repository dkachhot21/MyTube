import { db } from "./index.js";

async function check() {
    try {
        console.log("🔍 Checking database...");

        // Get user
        const userRes = await db.query("SELECT id FROM users WHERE username = $1", ['testuser']);
        if (userRes.rows.length === 0) {
            console.error("❌ User 'testuser' not found.");
            process.exit(1);
        }
        const userId = userRes.rows[0].id;
        console.log(`👤 User ID: ${userId}`);

        // Check media
        const mediaRes = await db.query("SELECT * FROM media WHERE user_id = $1", [userId]);
        console.log(`🎬 Media count: ${mediaRes.rows.length}`);
        if (mediaRes.rows.length > 0) {
            console.log(`First media: ${mediaRes.rows[0].internal_id} - ${mediaRes.rows[0].title}`);
        }

        // Check playback history
        const historyRes = await db.query("SELECT * FROM playback_history WHERE user_id = $1", [userId]);
        console.log(`⏯️  History count: ${historyRes.rows.length}`);
        if (historyRes.rows.length > 0) {
            console.log(`First history: ${historyRes.rows[0].media_id} - ${historyRes.rows[0].last_watched}`);
        }

        // Check join
        const joinRes = await db.query(`
        SELECT ph.*, m.title 
        FROM playback_history ph
        LEFT JOIN media m ON ph.media_id = m.internal_id AND m.user_id = ph.user_id
        WHERE ph.user_id = $1
    `, [userId]);
        console.log(`🔗 Join count: ${joinRes.rows.length}`);
        if (joinRes.rows.length > 0) {
            console.log(`First join: ${joinRes.rows[0].media_id} - Title: ${joinRes.rows[0].title}`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Check error:", err);
        process.exit(1);
    }
}

check();
