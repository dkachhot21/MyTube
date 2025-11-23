import React from 'react';
import { Link } from 'react-router-dom';
import './RelatedVideoCard.css';

const RelatedVideoCard = ({ video }) => {
  return (
    <div className="related-video-card">
      <Link to={`/play/${video.id}`} className="related-video-card__thumbnail-container">
        <img
          className="related-video-card__thumbnail"
          src={video.thumbnail}
          alt={video.title}
        />
        <span className="related-video-card__duration">{video.duration}</span>
      </Link>
      <div className="related-video-card__info">
        <h4>{video.title}</h4>
        <p>{video.channel}</p>
      </div>
    </div>
  );
};

export default RelatedVideoCard;
