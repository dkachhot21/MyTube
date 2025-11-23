DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS albums;

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    album_id VARCHAR(255) UNIQUE NOT NULL,
    key VARCHAR(255) NOT NULL,
    album_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media (
    internal_id VARCHAR(255) PRIMARY KEY,
    album_id VARCHAR(255),
    file_name TEXT,
    url TEXT,
    width INTEGER,
    height INTEGER,
    duration_ms BIGINT,
    timestamp_taken BIGINT,
    timestamp_uploaded BIGINT,
    title TEXT,
    season_number INTEGER,
    episode_number INTEGER,
    stars TEXT[],

    created_at TIMESTAMP DEFAULT NOW()
    ForEIGN KEY (album_id) REFERENCES albums(album_id)
);
