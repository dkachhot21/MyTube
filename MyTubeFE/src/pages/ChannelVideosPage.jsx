import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getMediaByAlbum } from '../services/api';
import { formatDuration } from '../utils/format';
import './ChannelVideosPage.css';

const ChannelVideosPage = () => {
    const { name } = useParams();
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('date-desc');

    // Convert frontend sort values to backend format
    const getSortParams = (sortType) => {
        const sortMap = {
            'date-desc': { sortBy: 'timestamp_taken', sortOrder: 'DESC' },
            'date-asc': { sortBy: 'timestamp_taken', sortOrder: 'ASC' },
            'title-asc': { sortBy: 'title', sortOrder: 'ASC' },
            'title-desc': { sortBy: 'title', sortOrder: 'DESC' },
            'duration-asc': { sortBy: 'duration_ms', sortOrder: 'ASC' },
            'duration-desc': { sortBy: 'duration_ms', sortOrder: 'DESC' },
        };
        return sortMap[sortType] || { sortBy: 'timestamp_taken', sortOrder: 'DESC' };
    };

    const fetchVideos = async (currentPage, isNewSort = false) => {
        if (loading) return;
        if (!isNewSort && !hasMore) return;
        if (!name) return;

        setLoading(true);
        const { sortBy: dbSortBy, sortOrder } = getSortParams(sortBy);
        const data = await getMediaByAlbum(name, currentPage, 20, dbSortBy, sortOrder);

        if (data.length === 0) {
            setHasMore(false);
        } else {
            const mappedVideos = data.map((item) => ({
                id: item.internal_id,
                title: item.title || item.file_name,
                thumbnail: `${item.url}=w800-h600-no`,
                channel: item.album_name || item.album_id || 'Unknown Channel',
                channelAvatar: 'https://via.placeholder.com/40x40.png?text=Ch',
                timestamp: new Date(Number(item.timestamp_taken)).toLocaleString(),
                duration: formatDuration(Number(item.duration_ms)),
                season: item.season,
                episode: item.episode,
                timestampRaw: Number(item.timestamp_taken),
                durationRaw: Number(item.duration_ms),
            }));

            if (isNewSort) {
                setVideos(mappedVideos);
            } else {
                setVideos((prev) => [...prev, ...mappedVideos]);
            }
        }
        setLoading(false);
    };

    // Fetch videos when page changes
    useEffect(() => {
        fetchVideos(page, false);
    }, [page, name]);

    // Reset and fetch when sort changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchVideos(1, true);
    }, [sortBy]);

    const handleLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    return (
        <div className="channel-videos-page">
            <div className="channel-videos-page__header">
                <h2>Videos from {name}</h2>
                <div className="channel-videos-page__sort">
                    <label htmlFor="sort">Sort by: </label>
                    <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="date-desc">Date (Newest)</option>
                        <option value="date-asc">Date (Oldest)</option>
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="duration-asc">Duration (Shortest)</option>
                        <option value="duration-desc">Duration (Longest)</option>
                    </select>
                </div>
            </div>
            {videos.length > 0 ? (
                <>
                    <div className="video-grid">
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="load-more-container" style={{ textAlign: 'center', margin: '20px 0' }}>
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backgroundColor: '#cc0000',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            ) : loading ? (
                <div>Loading...</div>
            ) : (
                <div className="no-results">No videos found for {name}</div>
            )}
        </div>
    );
};

export default ChannelVideosPage;
