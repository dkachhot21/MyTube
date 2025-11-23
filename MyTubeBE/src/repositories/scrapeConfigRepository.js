import { db } from '../db/index.js';

export const saveConfig = async (userId, config) => {
    const query = `
    INSERT INTO scrape_configs (user_id, config, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET config = $2, updated_at = NOW()
    RETURNING *;
  `;
    const result = await db.query(query, [userId, JSON.stringify(config)]);
    return result.rows[0];
};

export const getConfig = async (userId) => {
    const query = `
    SELECT config FROM scrape_configs WHERE user_id = $1;
  `;
    const result = await db.query(query, [userId]);
    return result.rows[0]?.config || [];
};
