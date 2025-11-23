import * as scrapeConfigRepository from '../repositories/scrapeConfigRepository.js';

export const saveConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const { config } = req.body;

        if (!Array.isArray(config)) {
            return res.status(400).json({ error: 'Config must be an array' });
        }

        const savedConfig = await scrapeConfigRepository.saveConfig(userId, config);
        res.json(savedConfig);
    } catch (error) {
        console.error('Error saving scrape config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
};

export const getConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const config = await scrapeConfigRepository.getConfig(userId);
        res.json(config);
    } catch (error) {
        console.error('Error fetching scrape config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
};
