import { db } from "./index.js";

export async function initDb() {
  // Drop all existing tables in correct order (respecting foreign keys)
  const dropTables = `
    DROP TABLE IF EXISTS scrape_configs CASCADE;
    DROP TABLE IF EXISTS playback_history CASCADE;
    DROP TABLE IF EXISTS sessions CASCADE;
    DROP TABLE IF EXISTS media CASCADE;
    DROP TABLE IF EXISTS albums CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `;

  // Enable UUID extension
  const enableExtensions = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `;

  // Create users table
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Create sessions table for token management
  const createSessions = `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_used TIMESTAMP DEFAULT NOW(),
      user_agent TEXT,
      ip_address VARCHAR(45)
    );
  `;

  // Create albums table with user ownership
  const createAlbums = `
    CREATE TABLE IF NOT EXISTS albums (
      id SERIAL PRIMARY KEY,
      album_id VARCHAR(255) NOT NULL,
      album_key VARCHAR(255) NOT NULL,
      album_name TEXT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(album_id, user_id)
    );
  `;

  // Create media table with user ownership
  const createMedia = `
    CREATE TABLE IF NOT EXISTS media (
      internal_id VARCHAR(255) NOT NULL,
      album_id VARCHAR(255) NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT,
      
      url TEXT,
      width INT,
      height INT,
      duration_ms BIGINT,
      
      timestamp_taken BIGINT,
      timestamp_uploaded BIGINT,
      
      title TEXT,
      season INT,
      episode INT,
      stars TEXT[],
      
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (internal_id, user_id)
    );
  `;

  // Create playback history table with metadata
  const createPlaybackHistory = `
    CREATE TABLE IF NOT EXISTS playback_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_id VARCHAR(255) NOT NULL,
      playback_position INTEGER DEFAULT 0,
      playback_headers JSONB,
      last_watched TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, media_id)
    );
  `;

  // Create scrape configuration table
  const createScrapeConfigs = `
    CREATE TABLE IF NOT EXISTS scrape_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      config JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id)
    );
  `;

  // Create indexes for performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
    CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
    CREATE INDEX IF NOT EXISTS idx_media_album_id ON media(album_id);
    CREATE INDEX IF NOT EXISTS idx_playback_user_id ON playback_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_playback_last_watched ON playback_history(last_watched);
    CREATE INDEX IF NOT EXISTS idx_scrape_configs_user_id ON scrape_configs(user_id);
  `;

  try {
    // console.log("🗑️  Dropping old tables...");
    // await db.query(dropTables);

    console.log("� Enabling extensions...");
    await db.query(enableExtensions);

    console.log("📦 Creating users table...");
    await db.query(createUsers);

    console.log("�🔐 Creating sessions table...");
    await db.query(createSessions);

    console.log("📁 Creating albums table...");
    await db.query(createAlbums);

    console.log("🎬 Creating media table...");
    await db.query(createMedia);

    console.log("⏯️  Creating playback_history table...");
    await db.query(createPlaybackHistory);

    console.log("⚙️  Creating scrape_configs table...");
    await db.query(createScrapeConfigs);

    console.log("⚡ Creating indexes...");
    await db.query(createIndexes);

    console.log("✅ Database initialized successfully with authentication schema");
  } catch (err) {
    console.error("❌ DB init error:", err);
    process.exit(1);
  }
}
