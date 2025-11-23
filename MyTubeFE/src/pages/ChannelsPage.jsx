import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllAlbums } from '../services/api';
import './ChannelsPage.css';

const ChannelsPage = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true);
            const data = await getAllAlbums();
            setChannels(data);
            setLoading(false);
        };

        fetchChannels();
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

    return (
        <div className="channels-page">
            <h2>All Channels</h2>
            {loading ? (
                <div>Loading...</div>
            ) : channels.length > 0 ? (
                <div className="channels-grid">
                    {channels.map((channel) => (
                        <Link
                            key={channel.album_id}
                            to={`/channel/${encodeURIComponent(channel.album_name)}`}
                            className="channel-card"
                        >
                            <div className="channel-card__avatar">
                                {getInitials(channel.album_name)}
                            </div>
                            <div className="channel-card__name">
                                <h3>{channel.album_name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-channels">No channels found</div>
            )}
        </div>
    );
};

export default ChannelsPage;
