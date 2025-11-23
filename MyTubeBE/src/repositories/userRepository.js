import { db } from "../db/index.js";
import bcrypt from "bcryptjs";

export async function createUser(username, email, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
        `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
        [username, email, passwordHash]
    );

    return result.rows[0];
}

export async function findUserByEmail(email) {
    const result = await db.query(
        `SELECT id, username, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
        [email]
    );

    return result.rows[0];
}

export async function findUserByUsername(username) {
    const result = await db.query(
        `SELECT id, username, email, password_hash, created_at
     FROM users
     WHERE username = $1`,
        [username]
    );

    return result.rows[0];
}

export async function findUserById(userId) {
    const result = await db.query(
        `SELECT id, username, email, created_at
     FROM users
     WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
}

export async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// Session management
export async function createSession(userId, tokenHash, expiresAt, userAgent, ipAddress) {
    const result = await db.query(
        `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_at`,
        [userId, tokenHash, expiresAt, userAgent, ipAddress]
    );

    return result.rows[0];
}

export async function updateSessionLastUsed(tokenHash) {
    await db.query(
        `UPDATE sessions
     SET last_used = NOW()
     WHERE token_hash = $1`,
        [tokenHash]
    );
}

export async function deleteSession(tokenHash) {
    await db.query(
        `DELETE FROM sessions
     WHERE token_hash = $1`,
        [tokenHash]
    );
}

export async function deleteExpiredSessions() {
    await db.query(
        `DELETE FROM sessions
     WHERE expires_at < NOW()`
    );
}

export async function getUserSessions(userId) {
    const result = await db.query(
        `SELECT id, created_at, last_used, user_agent, ip_address
     FROM sessions
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY last_used DESC`,
        [userId]
    );

    return result.rows;
}
