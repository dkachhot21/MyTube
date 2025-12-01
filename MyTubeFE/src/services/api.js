const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8999';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API functions
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    return data;
};

export const registerUser = async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    return data;
};

export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

export const getStreamUrl = (id, quality = '1080p') => {
    const token = localStorage.getItem('token');
    // Pass token as query param since video tags don't support headers
    return `${API_BASE_URL}/stream?id=${id}&quality=${quality}&token=${token}`;
};

export const getMediaById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/search/id?id=${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch media by id');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching media by id:', error);
        return null;
    }
};

export const getAllMedia = async (page = 1, limit = 20, sortBy = 'timestamp_taken', sortOrder = 'DESC', type = 'all') => {
    try {
        const response = await fetch(`${API_BASE_URL}/media?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch media');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching media:', error);
        return [];
    }
};

export const getMediaByAlbum = async (albumName, page = 1, limit = 20, sortBy = 'timestamp_taken', sortOrder = 'DESC') => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/search/album?album=${albumName}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch media by album');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching media by album:', error);
        return [];
    }
};

export const getMediaByStars = async (stars) => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/search/stars?stars=${stars}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch media by stars');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching media by stars:', error);
        return [];
    }
};

export const getAllAlbums = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/albums`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch albums');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching albums:', error);
        return [];
    }
};

export const searchMedia = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to search media');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching media:', error);
        return [];
    }
};

export const getAllStars = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/stars`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch stars');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stars:', error);
        return [];
    }
};

export const scrape = async (list) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            },
            body: JSON.stringify(list)
        });
        if (!response.ok) {
            throw new Error('Failed to start scrape');
        }
        return await response.json();
    } catch (error) {
        console.error('Error starting scrape:', error);
        throw error;
    }
};

export const getScrapeConfig = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scrape-config`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch scrape config');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching scrape config:', error);
        return [];
    }
};

export const saveScrapeConfig = async (config) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scrape-config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            },
            body: JSON.stringify({ config })
        });
        if (!response.ok) {
            throw new Error('Failed to save scrape config');
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving scrape config:', error);
        throw error;
    }
};

export const getHistory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/playback/history`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
};

export const savePlaybackPosition = async (mediaId, position) => {
    try {
        const response = await fetch(`${API_BASE_URL}/playback/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            },
            body: JSON.stringify({ mediaId, position })
        });
        if (!response.ok) {
            throw new Error('Failed to save playback position');
        }
        return await response.json();
    } catch (error) {
        console.error('Error saving playback position:', error);
    }
};

export const clearHistory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/playback/clear-all`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to clear history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
};
