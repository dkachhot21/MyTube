import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__logo-link">
          <h1 className="header__logo">MyTube</h1>
        </Link>
      </div>
      <div className="header__center">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>
      <div className="header__right">
        {user ? (
          <>
            <span className="header__greeting">Hi, {user.username}</span>
            <Link to="/account" className="header__account-link" title="Manage Account">
              <i className="fas fa-cog"></i>
            </Link>
            <button onClick={handleLogout} className="header__logout-btn" title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </>
        ) : (
          <div className="header__auth-buttons">
            <Link to="/login" className="header__login-btn">Login</Link>
            <Link to="/register" className="header__register-btn">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
