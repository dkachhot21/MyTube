import React, { useEffect, useState, useRef } from 'react';
import VideoCard from '../components/VideoCard';
import { getAllMedia } from '../services/api';
import './HomePage.css';
import { formatDuration } from '../utils/format';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterType, setFilterType] = useState('all');

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

    setLoading(true);
    const { sortBy: dbSortBy, sortOrder } = getSortParams(sortBy);
    const data = await getAllMedia(currentPage, 20, dbSortBy, sortOrder, filterType);

    if (data.length === 0) {
      setHasMore(false);
    } else {
      const mappedVideos = data.map((item) => ({
        id: item.internal_id,
        title: item.title || item.file_name,
        thumbnail: `${item.url}=w800-h600-no`,
        channel: item.album_name || item.album_id || 'Unknown Channel',
        channelAvatar: 'https://via.placeholder.com/40x40.png?text=Ch',
        views: '0', // Placeholder
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
        // Deduplicate videos by ID to prevent duplicate keys
        setVideos((prev) => {
          const videoMap = new Map(prev.map(v => [v.id, v]));
          mappedVideos.forEach(v => videoMap.set(v.id, v));
          return Array.from(videoMap.values());
        });
      }
    }
    setLoading(false);
  };

  // Fetch videos when page changes
  useEffect(() => {
    fetchVideos(page, false);
  }, [page]);

  // Reset and fetch when sort or filter changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchVideos(1, true);
  }, [sortBy, filterType]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="home-page">
      <div className="home-page__header">
        <h2>Home</h2>
        <div className="home-page__controls">
          <div className="home-page__filter">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === 'video' ? 'active' : ''}`}
              onClick={() => setFilterType('video')}
            >
              Videos
            </button>
            <button
              className={`filter-btn ${filterType === 'photo' ? 'active' : ''}`}
              onClick={() => setFilterType('photo')}
            >
              Photos
            </button>
          </div>
          <div className="home-page__sort">
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
      </div>
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
    </div>
  );
};

export default HomePage;
