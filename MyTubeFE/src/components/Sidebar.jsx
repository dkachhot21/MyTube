import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar__item">
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      <Link to="/stars" className="sidebar__item">
        <i className="fas fa-star"></i>
        <span>Stars</span>
      </Link>
      <Link to="/channels" className="sidebar__item">
        <i className="fas fa-video"></i>
        <span>Channels</span>
      </Link>
      <Link to="/history" className="sidebar__item">
        <i className="fas fa-history"></i>
        <span>History</span>
      </Link>
      <div className="sidebar__item">
        <i className="fas fa-clock"></i>
        <span>Watch later</span>
      </div>
    </div>
  );
};

export default Sidebar;
