import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllStars } from '../services/api';
import './StarsPage.css';

const StarsPage = () => {
    const [stars, setStars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChar, setSelectedChar] = useState('All');

    useEffect(() => {
        const fetchStars = async () => {
            setLoading(true);
            const data = await getAllStars();
            // Filter out empty or null star names
            const validStars = data.filter(star => star.star_name && star.star_name.trim() !== '');
            setStars(validStars);
            setLoading(false);
        };

        fetchStars();
    }, []);

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

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const filteredStars = selectedChar === 'All'
        ? stars
        : stars.filter(star => star.star_name.toUpperCase().startsWith(selectedChar));

    return (
        <div className="stars-page">
            <h2>All Stars</h2>
            <div className="stars-page__filter">
                <button
                    className={`filter-btn ${selectedChar === 'All' ? 'active' : ''}`}
                    onClick={() => setSelectedChar('All')}
                >
                    All
                </button>
                {alphabet.map(char => (
                    <button
                        key={char}
                        className={`filter-btn ${selectedChar === char ? 'active' : ''}`}
                        onClick={() => setSelectedChar(char)}
                    >
                        {char}
                    </button>
                ))}
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : filteredStars.length > 0 ? (
                <div className="stars-grid">
                    {filteredStars.map((star) => (
                        <Link
                            key={star.star_name}
                            to={`/star/${encodeURIComponent(star.star_name)}`}
                            className="star-card"
                        >
                            <div className="star-card__avatar">
                                {getInitials(star.star_name)}
                            </div>
                            <div className="star-card__name">
                                <h3>{star.star_name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-stars">No stars found{selectedChar !== 'All' ? ` starting with "${selectedChar}"` : ''}</div>
            )}
        </div>
    );
};

export default StarsPage;
