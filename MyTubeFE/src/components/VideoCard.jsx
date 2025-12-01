import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  return (
    <div className="video-card">
      <Link to={`/play/${video.id}`} className="video-card__thumbnail-container">
        <img className="video-card__thumbnail" src={video.thumbnail} alt={video.title} />
        {video.duration !== '00:00' && (
          <span className="video-card__duration">{video.duration}</span>
        )}
      </Link>
      <div className="video-card__info">
        <div className="video-card__avatar-initials" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#555',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '12px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          flexShrink: 0
        }}>
          {(video.channel || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="video-card__text">
          <Link to={`/play/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h4>{video.title}</h4>
          </Link>
          <p>{video.channel || 'Unknown Channel'}</p>
          <p>
            {video.season && video.episode && (
              <span style={{ marginRight: '8px', color: '#fff', fontWeight: 'bold' }}>
                S{video.season} E{video.episode}
              </span>
            )}
            {video.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
