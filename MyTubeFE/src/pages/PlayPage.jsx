import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RelatedVideoCard from '../components/RelatedVideoCard';
import { getMediaById, getStreamUrl, getMediaByStars, getMediaByAlbum } from '../services/api';
import { formatDuration } from '../utils/format';
import './PlayPage.css';

const PlayPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [quality, setQuality] = useState('1080p');
  const [starVideos, setStarVideos] = useState([]);
  const [channelVideos, setChannelVideos] = useState([]);

  useEffect(() => {
    // Scroll to top when video changes
    window.scrollTo(0, 0);

    const fetchVideo = async () => {
      const data = await getMediaById(id);
      if (data) {
        setVideo({
          id: data.internal_id,
          title: data.title || data.file_name,
          description: 'No description available.',
          src: getStreamUrl(data.internal_id, quality),
          channel: data.album_name || 'Unknown Channel',
          stars: data.stars || [],
          views: '0', // Placeholder
          timestamp: new Date(Number(data.timestamp_taken)).toLocaleString(),
          duration: formatDuration(Number(data.duration_ms)),
          season: data.season,
          episode: data.episode,
        });

        // Fetch related videos
        let relatedByStars = [];
        let relatedByAlbum = [];

        if (data.stars && data.stars.length > 0) {
          // Fetch for all stars and flatten
          const starsPromises = data.stars.map(star => getMediaByStars(star));
          const starsResults = await Promise.all(starsPromises);
          relatedByStars = starsResults.flat();
        }

        if (data.album_name) {
          relatedByAlbum = await getMediaByAlbum(data.album_name);
        }

        // Deduplicate and map Star Videos
        const uniqueStarVideos = Array.from(new Map(relatedByStars.map(item => [item.internal_id, item])).values());
        const mappedStarVideos = uniqueStarVideos
          .filter(v => v.internal_id !== data.internal_id)
          .map(item => ({
            id: item.internal_id,
            title: item.title || item.file_name,
            thumbnail: `${item.url}=w800-h600-no`,
            channel: item.album_name || 'Unknown Channel',
            views: '0',
            timestamp: new Date(Number(item.timestamp_taken)).toLocaleString(),
            duration: new Date(Number(item.duration_ms)).toISOString().substr(14, 5),
          }))
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        setStarVideos(mappedStarVideos);

        // Deduplicate and map Channel Videos
        const uniqueChannelVideos = Array.from(new Map(relatedByAlbum.map(item => [item.internal_id, item])).values());
        const mappedChannelVideos = uniqueChannelVideos
          .filter(v => v.internal_id !== data.internal_id)
          .map(item => ({
            id: item.internal_id,
            title: item.title || item.file_name,
            thumbnail: `${item.url}=w800-h600-no`,
            channel: item.album_name || 'Unknown Channel',
            views: '0',
            timestamp: new Date(Number(item.timestamp_taken)).toLocaleString(),
            duration: new Date(Number(item.duration_ms)).toISOString().substr(14, 5),
          }))
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        setChannelVideos(mappedChannelVideos);
      }
    };

    fetchVideo();
  }, [id, quality]);

  useEffect(() => {
    if (video && video.id) {
      // Save initial position (0) to add to history immediately
      import('../services/api').then(({ savePlaybackPosition }) => {
        savePlaybackPosition(video.id, 0);
      });
    }
  }, [video]);

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
  };

  const getInitials = (name) => {
    return name
      ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      : '??';
  };

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div className="play-page">
      <div className="play-page__main">
        <div className="video-player">
          <video
            src={video.src}
            controls
            autoPlay
            width="100%"
            height="100%"
            style={{ backgroundColor: 'black' }}
          >
            Your browser does not support the video tag.
          </video>
          <div className="quality-selector">
            <label htmlFor="quality">Quality: </label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => handleQualityChange(e.target.value)}
            >
              <option value="4k">4K</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="360p">360p</option>
            </select>
          </div>
        </div>
        <div className="video-details">
          <h2>{video.title}</h2>
          <div className="video-details__info">
            <span>
              {video.season && video.episode && (
                <span style={{ marginRight: '12px', color: '#fff', fontWeight: 'bold' }}>
                  Season {video.season} Episode {video.episode}
                </span>
              )}
              {video.timestamp}
            </span>
          </div>
        </div>
        <div className="video-description">
          <div className="video-description__channel">
            <div className="channel-initials" style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#555',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '16px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {getInitials(video.channel)}
            </div>
            <div className="video-description__channel-info">
              <h4>{video.channel}</h4>
              {video.stars && video.stars.length > 0 && (
                <span>Starring: {video.stars.join(', ')}</span>
              )}
            </div>
          </div>
          <p>{video.description}</p>
        </div>

        {starVideos.length > 0 && (
          <div className="star-videos-section">
            <h3>More from Stars</h3>
            <div className="star-videos-grid">
              {starVideos.map((video) => (
                <RelatedVideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="play-page__related">
        <h3>More from {video.channel}</h3>
        {channelVideos.map((video) => (
          <RelatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default PlayPage;
