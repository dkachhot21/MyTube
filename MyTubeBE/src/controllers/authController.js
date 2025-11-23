import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    verifyPassword,
    createSession,
    getUserSessions,
    deleteSession
} from '../repositories/userRepository.js';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// Register new user
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // Create user
        const user = await createUser(username, email, password);

        // Generate token
        const token = generateToken(user);

        // Create session
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await createSession(
            user.id,
            tokenHash,
            expiresAt,
            req.headers['user-agent'],
            req.ip
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}

// Login user
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Create session
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await createSession(
            user.id,
            tokenHash,
            expiresAt,
            req.headers['user-agent'],
            req.ip
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}

// Get current user
export async function getCurrentUser(req, res) {
    try {
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
}

// Logout user
export async function logout(req, res) {
    try {
        const token = req.headers.authorization?.substring(7);
        if (token) {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            await deleteSession(tokenHash);
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
}

// Get user sessions
export async function getSessions(req, res) {
    try {
        const sessions = await getUserSessions(req.user.id);
        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
}
