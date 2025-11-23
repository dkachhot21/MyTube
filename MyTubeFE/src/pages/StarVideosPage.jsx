import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getMediaByStars } from '../services/api';
import './StarVideosPage.css';

const StarVideosPage = () => {
    const { name } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            if (name) {
                const data = await getMediaByStars(name);
                const mappedVideos = data.map((item) => ({
                    id: item.internal_id,
                    title: item.title || item.file_name,
                    thumbnail: `${item.url}=w800-h600-no`,
                    channel: item.album_name || item.album_id || 'Unknown Channel',
                    channelAvatar: 'https://via.placeholder.com/40x40.png?text=Ch',
                    timestamp: new Date(Number(item.timestamp_taken)).toLocaleString(),
                    duration: new Date(Number(item.duration_ms)).toISOString().substr(14, 5),
                    season: item.season,
                    episode: item.episode,
                }));
                setVideos(mappedVideos);
            }
            setLoading(false);
        };

        fetchVideos();
    }, [name]);

    return (
        <div className="star-videos-page">
            <h2>Videos starring {name}</h2>
            {loading ? (
                <div>Loading...</div>
            ) : videos.length > 0 ? (
                <div className="video-grid">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="no-results">No videos found for {name}</div>
            )}
        </div>
    );
};

export default StarVideosPage;
