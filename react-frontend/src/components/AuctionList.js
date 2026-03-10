import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'ended'
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchAuctions();
    }, [filter]);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            let data;
            if (filter === 'active') {
                data = await api.getActive();
            } else if (filter === 'ended') {
                data = await api.getEnded();
            } else {
                data = await api.getAll();
            }
            
            if (data.success) {
                setAuctions(data.auctions || []);
            }
        } catch (error) {
            console.error('Error fetching auctions:', error);
            toast.error('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end - now;
        
        if (diffMs <= 0) return 'Ended';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
        if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
        if (diffMinutes > 0) return `${diffMinutes}m ${diffSeconds}s`;
        return `${diffSeconds}s`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="auction-list-container">
            <div className="auction-header">
                <h1>Live Auctions</h1>
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Auctions
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'ended' ? 'active' : ''}`}
                        onClick={() => setFilter('ended')}
                    >
                        Ended
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading auctions...</div>
            ) : auctions.length === 0 ? (
                <div className="no-auctions">
                    <p>No auctions found.</p>
                </div>
            ) : (
                <div className="auction-grid">
                    {auctions.map((auction) => (
                        <div key={auction._id} className="auction-card">
                            <div className="auction-image">
                                <img 
                                    src={`http://localhost:3003/${auction.image_url}`} 
                                    alt={auction.title}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFNUU1RTUiLz48dGV4dCB4PSIyNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QXVjdGlvbiBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                    }}
                                />
                                <div className="auction-status">
                                    <span className={`status-badge ${new Date(auction.end_time) > new Date() ? 
                                        (formatTimeRemaining(auction.end_time).includes('h') || formatTimeRemaining(auction.end_time).includes('d') ? 'upcoming' : 'live') : 
                                        'ended'}`}>
                                        {new Date(auction.end_time) > new Date() ? 
                                            (formatTimeRemaining(auction.end_time).includes('h') || formatTimeRemaining(auction.end_time).includes('d') ? 'Upcoming' : 'Live') : 
                                            'Ended'}
                                    </span>
                                    {auction.active_bidders > 0 && (
                                        <span className="status-badge bidders-badge">
                                            👥 {auction.active_bidders}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="auction-details">
                                <h3>{auction.title}</h3>
                                <p className="auction-description">{auction.description}</p>
                                
                                <div className="auction-info">
                                    <div className="info-row">
                                        <span className="info-label">Current Bid:</span>
                                        <span className="info-value highlight">{formatCurrency(auction.current_bid)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Starting Bid:</span>
                                        <span className="info-value">{formatCurrency(auction.starting_bid)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Time Remaining:</span>
                                        <span className="info-value time-remaining">
                                            {formatTimeRemaining(auction.end_time)}
                                        </span>
                                    </div>
                                    {auction.active_bidders > 0 && (
                                        <div className="info-row">
                                            <span className="info-label">Active Bidders:</span>
                                            <span className="info-value bidders-count">
                                                👥 {auction.active_bidders}
                                            </span>
                                        </div>
                                    )}
                                    {auction.total_bids > 0 && (
                                        <div className="info-row">
                                            <span className="info-label">Total Bids:</span>
                                            <span className="info-value bids-count">
                                                🔥 {auction.total_bids}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="auction-actions">
                                    {isAuthenticated && new Date(auction.end_time) > new Date() ? (
                                        <Link 
                                            to={`/auctions/${auction._id}`}
                                            className="btn btn-primary btn-block"
                                        >
                                            Join Live Auction
                                        </Link>
                                    ) : (
                                        <button 
                                            className="btn btn-secondary btn-block"
                                            disabled={!isAuthenticated}
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    toast.info('Please login to join live auctions');
                                                }
                                            }}
                                        >
                                            {isAuthenticated ? 'View Details' : 'Login to Bid'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuctionList;