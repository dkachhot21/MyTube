import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header or query parameter
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Optional middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email
            };
        }

        next();
    } catch (error) {
        // Continue without user info if token is invalid
        next();
    }
};
