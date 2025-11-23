import { db } from "./index.js";

async function seed() {
    try {
        console.log("🌱 Seeding database...");

        // Get user
        const userRes = await db.query("SELECT id FROM users WHERE username = $1", ['testuser']);
        if (userRes.rows.length === 0) {
            console.error("❌ User 'testuser' not found. Please register first.");
            process.exit(1);
        }
        const userId = userRes.rows[0].id;
        console.log(`👤 Found user: ${userId}`);

        // Create album
        const albumId = 'test-album-id';
        await db.query(`
      INSERT INTO albums (album_id, album_key, album_name, user_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (album_id, user_id) DO NOTHING
    `, [albumId, 'test-key', 'Test Album', userId]);
        console.log("📁 Created album");

        // Create media
        const mediaId = 'test-media-id';
        await db.query(`
      INSERT INTO media (
        internal_id, album_id, user_id, file_name, url, 
        width, height, duration_ms, timestamp_taken, timestamp_uploaded, 
        title
      )
      VALUES (
        $1, $2, $3, 'test_video.mp4', 
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        1920, 1080, 60000, 1672531200000, 1672531200000,
        'Big Buck Bunny'
      )
      ON CONFLICT (internal_id, user_id) DO NOTHING
    `, [mediaId, albumId, userId]);
        console.log("🎬 Created media");

        console.log("✅ Seeding complete");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
}

seed();
