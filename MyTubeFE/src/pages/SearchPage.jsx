import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { searchMedia } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            if (query) {
                const data = await searchMedia(query);
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

        fetchResults();
    }, [query]);

    return (
        <div className="search-page">
            <h2>Search results for "{query}"</h2>
            {loading ? (
                <div>Loading...</div>
            ) : videos.length > 0 ? (
                <div className="video-grid">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="no-results">No results found for "{query}"</div>
            )}
        </div>
    );
};

export default SearchPage;
