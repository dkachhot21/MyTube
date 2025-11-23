import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getHistory } from '../services/api';
import VideoCard from '../components/VideoCard';
import './HistoryPage.css';

const HistoryPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const historyData = await getHistory();
                // The history endpoint returns an array of history objects which contain the media
                // We need to map this to the format VideoCard expects, or if the endpoint returns media directly
                // Based on controller, it returns history items. Let's assume we need to extract media or it returns enriched media.
                // Actually, looking at playbackRepository.js, getPlaybackHistory joins with media table and returns media fields.
                // So the data should be directly usable as video objects.
                const mappedVideos = historyData.map(item => ({
                    id: item.media_id,
                    title: item.title || item.file_name,
                    thumbnail: `${item.url}=w800-h600-no`,
                    channel: item.album_name || 'Unknown Channel',
                    duration: item.duration_ms ? new Date(Number(item.duration_ms)).toISOString().substr(14, 5) : '00:00',
                    timestamp: new Date(item.last_watched).toLocaleString(),
                    views: 'Watched'
                }));
                setVideos(mappedVideos);
            } catch (error) {
                console.error('Failed to load history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [location]);

    if (loading) {
        return <div className="history-page loading">Loading history...</div>;
    }

    return (
        <div className="history-page">
            <h2>Watch History</h2>
            {videos.length === 0 ? (
                <p className="no-history">No watch history found.</p>
            ) : (
                <div className="history-grid">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
