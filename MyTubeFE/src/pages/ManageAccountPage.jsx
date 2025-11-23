import React, { useState, useEffect } from 'react';
import { scrape, getScrapeConfig, saveScrapeConfig } from '../services/api';
import './ManageAccountPage.css';

const ManageAccountPage = () => {
    const [rows, setRows] = useState([{ url: '', albumName: '' }]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const config = await getScrapeConfig();
            if (config && config.length > 0) {
                setRows(config);
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { url: '', albumName: '' }]);
    };

    const handleRemoveRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleSaveChanges = async () => {
        const validRows = rows.filter(row => row.url.trim() || row.albumName.trim());
        setLoading(true);
        try {
            await saveScrapeConfig(validRows);
            setStatus('Configuration saved successfully!');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus(`Error saving config: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLibrary = async () => {
        // Filter out empty rows
        const validRows = rows.filter(row => row.url.trim() && row.albumName.trim());

        if (validRows.length === 0) {
            setStatus('Please enter at least one valid URL and Album Name.');
            return;
        }

        setLoading(true);
        setStatus('Saving config and starting scrape process...');

        try {
            // Save config first
            await saveScrapeConfig(validRows);

            // Then scrape
            await scrape(validRows);
            setStatus('Scrape process started successfully! Check back later.');
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all your watch history? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setStatus('Clearing history...');

        try {
            const { clearHistory } = await import('../services/api');
            await clearHistory();
            setStatus('Watch history cleared successfully!');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus(`Error clearing history: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-account-page">
            <div className="manage-container">
                <h2>Manage Account</h2>
                <p className="description">Add Google Photos album URLs to scrape and add to your library.</p>

                <div className="rows-container">
                    {rows.map((row, index) => (
                        <div key={index} className="input-row">
                            <input
                                type="text"
                                placeholder="Album URL"
                                value={row.url}
                                onChange={(e) => handleChange(index, 'url', e.target.value)}
                                className="url-input"
                            />
                            <input
                                type="text"
                                placeholder="Album Name"
                                value={row.albumName}
                                onChange={(e) => handleChange(index, 'albumName', e.target.value)}
                                className="name-input"
                            />
                            <button
                                onClick={() => handleRemoveRow(index)}
                                className="remove-btn"
                                title="Remove row"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="actions">
                    <button onClick={handleAddRow} className="add-row-btn">
                        <i className="fas fa-plus"></i> Add Row
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="save-btn"
                        disabled={loading}
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={handleUpdateLibrary}
                        className="update-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Update Library'}
                    </button>
                    <button
                        onClick={handleClearHistory}
                        className="clear-history-btn"
                        disabled={loading}
                    >
                        <i className="fas fa-trash"></i> Clear History
                    </button>
                </div>

                {status && (
                    <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAccountPage;
