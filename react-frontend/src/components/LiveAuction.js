import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const LiveAuction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isConnected, placeBid, on, off } = useWebSocket();
    
    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isAuctionEnded, setIsAuctionEnded] = useState(false);
    const [bidHistory, setBidHistory] = useState([]);
    const [activeBidders, setActiveBidders] = useState([]);
    
    const timerRef = useRef(null);

    useEffect(() => {
        fetchAuctionDetails();
        setupWebSocketListeners();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            cleanupWebSocketListeners();
        };
    }, [id]);

    const fetchAuctionDetails = async () => {
        setLoading(true);
        try {
            const [auctionData, bidsData, highestBidData] = await Promise.all([
                api.getById(id),
                api.getAuctionBids(id),
                api.getHighestBid(id)
            ]);

            if (auctionData.success) {
                setAuction(auctionData.auction);
                updateTimeRemaining(auctionData.auction.end_time);
                startTimer(auctionData.auction.end_time);
            }

            if (bidsData.success) {
                setBids(bidsData.bids || []);
            }

            if (highestBidData.success && highestBidData.bid) {
                setBidAmount((highestBidData.bid.bidAmount + 100).toString());
            } else if (auctionData.success) {
                setBidAmount((auctionData.auction.current_bid + 100).toString());
            }
        } catch (error) {
            console.error('Error fetching auction details:', error);
            toast.error('Failed to load auction details');
        } finally {
            setLoading(false);
        }
    };

    const setupWebSocketListeners = () => {
        const handleNewBid = (data) => {
            if (data.auctionId === id) {
                setBids(prev => [data.bid, ...prev]);
                setAuction(prev => prev ? { ...prev, current_bid: data.bid.bidAmount } : null);
                
                toast.info(`New bid: ${formatCurrency(data.bid.bidAmount)} by ${data.bid.bidder.username}`);
            }
        };

        const handleAuctionEnded = (data) => {
            if (data.auctionId === id) {
                setIsAuctionEnded(true);
                toast.warning('Auction has ended!');
            }
        };

        on('new_bid', handleNewBid);
        on('auction_ended', handleAuctionEnded);

        return () => {
            off('new_bid', handleNewBid);
            off('auction_ended', handleAuctionEnded);
        };
    };

    const cleanupWebSocketListeners = () => {
        // Cleanup will be handled by the return function from setupWebSocketListeners
    };

    const startTimer = (endTime) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            updateTimeRemaining(endTime);
        }, 1000);
    };

    const updateTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end - now;
        
        if (diffMs <= 0) {
            setTimeRemaining('Auction Ended');
            setIsAuctionEnded(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            return;
        }
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (diffDays > 0) {
            setTimeRemaining(`${diffDays}d ${diffHours}h ${diffMinutes}m`);
        } else if (diffHours > 0) {
            setTimeRemaining(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
        } else {
            setTimeRemaining(`${diffMinutes}m ${diffSeconds}s`);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
            toast.error('Please enter a valid bid amount');
            return;
        }

        const bidValue = parseFloat(bidAmount);
        
        if (auction && bidValue <= auction.current_bid) {
            toast.error(`Bid must be higher than current bid: ${formatCurrency(auction.current_bid)}`);
            return;
        }

        if (!isConnected) {
            toast.error('Cannot place bid: Not connected to live updates');
            return;
        }

        try {
            const success = placeBid(id, bidValue);
            if (success) {
                toast.success('Bid placed successfully!');
                setBidAmount((bidValue + 100).toString());
            }
        } catch (error) {
            console.error('Error placing bid:', error);
            toast.error('Failed to place bid');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Generate sample bidders for demonstration
    const generateSampleBidders = (auctionData) => {
        const bidderNames = [
            'Alex Johnson', 'Maria Garcia', 'David Smith', 'Sarah Williams',
            'James Brown', 'Lisa Miller', 'Robert Davis', 'Emma Wilson',
            'Michael Taylor', 'Sophia Anderson', 'William Thomas', 'Olivia Martinez'
        ];
        
        const statuses = ['Active Now', 'Bidding', 'Watching', 'Recently Active'];
        const timeAgo = ['Just now', '2 min ago', '5 min ago', '10 min ago'];
        
        const bidders = [];
        const bidderCount = Math.min(auctionData.active_bidders || 5, bidderNames.length);
        
        for (let i = 0; i < bidderCount; i++) {
            const baseBid = auctionData.starting_bid;
            const maxBid = auctionData.current_bid;
            const bidIncrement = Math.floor((maxBid - baseBid) / bidderCount);
            
            bidders.push({
                name: bidderNames[i],
                status: statuses[i % statuses.length],
                lastBid: baseBid + (bidIncrement * (i + 1)),
                lastActive: timeAgo[i % timeAgo.length]
            });
        }
        
        // Sort by last bid (highest first)
        return bidders.sort((a, b) => b.lastBid - a.lastBid);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading auction details...</div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="error-container">
                <h2>Auction not found</h2>
                <button onClick={() => navigate('/auctions')} className="btn btn-primary">
                    Back to Auctions
                </button>
            </div>
        );
    }

    return (
        <div className="live-auction-container">
            <div className="auction-header">
                <button onClick={() => navigate('/auctions')} className="btn btn-back">
                    ← Back to Auctions
                </button>
                <h1>{auction.title}</h1>
                <div className="connection-status">
                    <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                    {isConnected ? 'Live Connected' : 'Disconnected'}
                </div>
            </div>

            <div className="auction-content">
                <div className="auction-main">
                    <div className="auction-image-large">
                        <img 
                            src={`http://localhost:3003/${auction.image_url}`} 
                            alt={auction.title}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFNUU1RTUiLz48dGV4dCB4PSIyNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QXVjdGlvbiBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                    </div>

                    <div className="auction-info-card">
                        <h2>{auction.title}</h2>
                        <p className="auction-description">{auction.description}</p>
                        
                        {/* Timer Section */}
                        <div className={`timer-container ${timeRemaining.includes('m') && parseInt(timeRemaining) < 10 ? 'timer-critical' : timeRemaining.includes('h') && parseInt(timeRemaining) < 1 ? 'timer-warning' : ''}`}>
                            <div className="timer-label">Auction Ends In</div>
                            <div className="timer-value">{timeRemaining}</div>
                        </div>
                        
                        {/* Enhanced Stats Grid */}
                        <div className="auction-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-value highlight">
                                    {formatCurrency(auction.current_bid)}
                                </div>
                                <div className="stat-label">Current Bid</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-value">
                                    {formatCurrency(auction.starting_bid)}
                                </div>
                                <div className="stat-label">Starting Bid</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-value bidders-count">
                                    {auction.active_bidders || 0}
                                </div>
                                <div className="stat-label">Active Bidders</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🔥</div>
                                <div className="stat-value bids-count">
                                    {auction.total_bids || bids.length}
                                </div>
                                <div className="stat-label">Total Bids</div>
                            </div>
                        </div>

                        {!isAuctionEnded && (
                            <div className="bid-section">
                                <div className="bid-input-group">
                                    <label htmlFor="bidAmount">Place Your Bid (₹ INR)</label>
                                    <div className="bid-input-wrapper">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            id="bidAmount"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            placeholder="Enter your bid amount"
                                            min={auction.current_bid + 100}
                                            step="100"
                                            disabled={!isConnected}
                                        />
                                    </div>
                                    <div className="bid-hint">
                                        <span>Minimum bid: {formatCurrency(auction.current_bid + 100)}</span>
                                        <span>Buy Now: {formatCurrency(auction.buy_now_price)}</span>
                                    </div>
                                </div>
                                <div className="bid-actions">
                                    <button
                                        onClick={handlePlaceBid}
                                        className="btn-bid"
                                        disabled={!isConnected || isAuctionEnded}
                                    >
                                        {isConnected ? '🚀 Place Bid' : '🔌 Connecting...'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (auction.buy_now_price) {
                                                setBidAmount(auction.buy_now_price);
                                                toast.info(`Buy Now price set to ${formatCurrency(auction.buy_now_price)}`);
                                            }
                                        }}
                                        className="btn-buy-now"
                                        disabled={!isConnected || isAuctionEnded}
                                    >
                                        ⚡ Buy Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {isAuctionEnded && (
                            <div className="auction-ended-banner">
                                <h3>⚠️ Auction Has Ended</h3>
                                <p>This auction is no longer accepting bids.</p>
                            </div>
                        )}
                        
                        {/* Active Bidders Section */}
                        {auction.active_bidders > 0 && !isAuctionEnded && (
                            <div className="active-bidders-section">
                                <h3>👥 Active Bidders ({auction.active_bidders})</h3>
                                <div className="bidders-list">
                                    {generateSampleBidders(auction).map((bidder, index) => (
                                        <div key={index} className="bidder-item">
                                            <div className="bidder-info">
                                                <div className="bidder-avatar">
                                                    {bidder.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="bidder-details">
                                                    <div className="bidder-name">{bidder.name}</div>
                                                    <div className="bidder-status">{bidder.status}</div>
                                                </div>
                                            </div>
                                            <div className="bidder-bid">
                                                <div className="bidder-bid-amount">{formatCurrency(bidder.lastBid)}</div>
                                                <div className="bidder-bid-time">{bidder.lastActive}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bid-history">
                    <div className="bid-history-header">
                        <h3>📊 Bid History</h3>
                        <div className="bid-stats">
                            <div className="bid-stat">
                                <div className="bid-stat-value">{bids.length}</div>
                                <div className="bid-stat-label">Total Bids</div>
                            </div>
                            <div className="bid-stat">
                                <div className="bid-stat-value">{auction.active_bidders || 0}</div>
                                <div className="bid-stat-label">Bidders</div>
                            </div>
                        </div>
                    </div>
                    {bids.length === 0 ? (
                        <p className="no-bids">No bids yet. Be the first to bid! 🎯</p>
                    ) : (
                        <div className="bid-list">
                            {bids.map((bid, index) => (
                                <div key={bid._id || index} className="bid-item">
                                    <div className="bid-amount">
                                        <strong>{formatCurrency(bid.bidAmount)}</strong>
                                    </div>
                                    <div className="bid-info">
                                        <span className="bidder">
                                            👤 {bid.bidder?.username || 'Anonymous'}
                                        </span>
                                        <span className="bid-time">
                                            {formatDate(bid.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveAuction;