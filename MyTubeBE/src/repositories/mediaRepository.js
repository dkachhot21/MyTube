import { db } from "../db/index.js";
import { parseFileName } from "../utils/parseFilename.js";

export async function saveAlbum(albumId, albumName, key, userId) {
    await db.query(
        `INSERT INTO albums (album_id, album_name, album_key, user_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (album_id, user_id) DO NOTHING`,
        [albumId, albumName, key, userId]
    );
}

export async function saveMediaItems(albumId, mediaList, userId) {
    const query = `
    INSERT INTO media (
      internal_id, album_id, user_id, url, width, height, duration_ms,
      timestamp_taken, timestamp_uploaded, file_name, season, episode, stars, title
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT (internal_id, user_id) DO UPDATE SET
      url = EXCLUDED.url,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      duration_ms = EXCLUDED.duration_ms,
      timestamp_taken = EXCLUDED.timestamp_taken,
      timestamp_uploaded = EXCLUDED.timestamp_uploaded,
      file_name = EXCLUDED.file_name,
      season = EXCLUDED.season,
      episode = EXCLUDED.episode,
      stars = EXCLUDED.stars,
      title = EXCLUDED.title;
  `;

    for (const item of mediaList) {
        const { title, season, episode, stars } = parseFileName(item.fileName);

        await db.query(query, [
            item.internalId,
            albumId,
            userId,
            item.url,
            item.width,
            item.height,
            item.Duration,
            item.timestampTaken,
            item.timestampUploaded,
            item.fileName,
            season,
            episode,
            stars,
            title,
        ]);
    }
}

/* -------------------- SEARCH: Season + Episode -------------------- */
export async function fetchBySeason(season, userId) {
    const result = await db.query(
        `
      SELECT m.*, a.album_name
      FROM media m
      LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
      WHERE m.season = $1 AND m.user_id = $2
      ORDER BY m.episode ASC
      `,
        [season, userId]
    );
    return result.rows;
}

export async function fetchSeasonEpisode(season, episode, userId) {
    const result = await db.query(
        `
    SELECT m.*, a.album_name
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
    WHERE m.season = $1
      AND m.episode = $2
      AND m.user_id = $3
    ORDER BY m.timestamp_uploaded DESC
    `,
        [season, episode, userId]
    );
    return result.rows;
}

/* -------------------- SEARCH: Tags (stars column) -------------------- */
export async function fetchByStars(tags, userId) {
    const normalized = tags.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    );
    const result = await db.query(
        `
    SELECT m.*, a.album_name
        FROM media m
        LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
        WHERE m.user_id = $2
          AND EXISTS (
            SELECT 1
            FROM unnest(m.stars) AS elem
            WHERE elem ILIKE ANY (
                ARRAY(
                    SELECT array_agg('%' || tag || '%')
                    FROM unnest($1::text[]) AS tag
                )
            )
        )
        ORDER BY m.timestamp_uploaded DESC
    `,
        [normalized, userId]
    );

    return result.rows;
}

/* -------------------- SEARCH: Name (title OR file_name) -------------------- */
export async function fetchByName(name, userId) {
    const like = `%${name}%`;

    const result = await db.query(
        `
    SELECT m.*, a.album_name
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
    WHERE m.user_id = $2
      AND (m.title ILIKE $1 OR m.file_name ILIKE $1)
    ORDER BY m.timestamp_uploaded DESC
    `,
        [like, userId]
    );

    return result.rows;
}

/* -------------------- SEARCH: Internal ID -------------------- */
export async function fetchById(Id, userId) {
    const like = `%${Id}%`;

    const result = await db.query(
        `
    SELECT m.*, a.album_name
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
    WHERE m.internal_id ILIKE $1 AND m.user_id = $2
    ORDER BY m.timestamp_uploaded DESC
    `,
        [like, userId]
    );

    return result.rows[0];
}

/* -------------------- GET ALL with pagination and sorting -------------------- */
export async function fetchAll(userId, page = 1, limit = 20, sortBy = 'timestamp_taken', sortOrder = 'DESC') {
    const offset = (page - 1) * limit;

    // Map frontend sort values to database columns
    const sortColumnMap = {
        'timestamp_taken': 'm.timestamp_taken',
        'title': 'm.title',
        'duration_ms': 'm.duration_ms',
        'file_name': 'm.file_name'
    };

    // Validate sortBy and sortOrder to prevent SQL injection
    const column = sortColumnMap[sortBy] || 'm.timestamp_taken';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await db.query(
        `
    SELECT m.*, a.album_name
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
    WHERE m.user_id = $1
    ORDER BY ${column} ${order}
    LIMIT $2 OFFSET $3
    `,
        [userId, limit, offset]
    );

    return result.rows;
}

/* -------------------- SEARCH: Album name -------------------- */
export async function fetchByAlbum(album, userId, page = 1, limit = 20, sortBy = 'timestamp_taken', sortOrder = 'DESC') {
    const like = `%${album}%`;
    const offset = (page - 1) * limit;

    // Map frontend sort values to database columns
    const sortColumnMap = {
        'timestamp_taken': 'm.timestamp_taken',
        'title': 'm.title',
        'duration_ms': 'm.duration_ms',
        'file_name': 'm.file_name'
    };

    // Validate sortBy and sortOrder to prevent SQL injection
    const column = sortColumnMap[sortBy] || 'm.timestamp_taken';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await db.query(
        `
      SELECT m.*, a.album_name
      FROM media m
      JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
      WHERE a.album_name ILIKE $1 AND a.user_id = $2
      ORDER BY ${column} ${order}
      LIMIT $3 OFFSET $4
    `,
        [like, userId, limit, offset]
    );

    return result.rows;
}

/* -------------------- SEARCH: Unified Search -------------------- */
export async function fetchByUnifiedSearch(query, userId) {
    const like = `%${query}%`;
    const numericQuery = parseInt(query);
    const isNumeric = !isNaN(numericQuery);

    const result = await db.query(
        `
    SELECT m.*, a.album_name
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.album_id AND a.user_id = m.user_id
    WHERE m.user_id = $2
      AND (m.title ILIKE $1
       OR m.file_name ILIKE $1
       OR EXISTS (
           SELECT 1
           FROM unnest(m.stars) AS elem
           WHERE elem ILIKE $1
       )
       ${isNumeric ? 'OR m.season = $3 OR m.episode = $3' : ''})
    ORDER BY m.timestamp_uploaded DESC
    `,
        isNumeric ? [like, userId, numericQuery] : [like, userId]
    );

    return result.rows;
}

/* -------------------- SEARCH: All Stars -------------------- */
export async function fetchAllStars(userId) {
    const result = await db.query(
        `
    SELECT DISTINCT unnest(stars) AS star_name
    FROM media
    WHERE user_id = $1
      AND stars IS NOT NULL
      AND array_length(stars, 1) > 0
    ORDER BY star_name ASC
    `,
        [userId]
    );
    return result.rows;
}

/* -------------------- SEARCH: All Albums -------------------- */
export async function fetchAllAlbums(userId) {
    const result = await db.query(
        `
    SELECT *
    FROM albums
    WHERE user_id = $1
    ORDER BY album_name ASC
    `,
        [userId]
    );
    return result.rows;
}
