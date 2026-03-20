import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'react-toastify';
import { FiClock, FiUsers, FiTrendingUp, FiDollarSign, FiChevronLeft, FiActivity, FiZap, FiAlertCircle, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { HiOutlineLightningBolt, HiOutlineFire } from 'react-icons/hi';

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
    const [activeBidders, setActiveBidders] = useState([]);
    const [isWatching, setIsWatching] = useState(false);
    const [bidIncrement, setBidIncrement] = useState(100);
    
    const timerRef = useRef(null);
    const bidHistoryRef = useRef(null);

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
            // Mock data for demonstration
            const mockAuction = {
                id: id,
                title: "Vintage Rolex Submariner 1680",
                description: "Rare vintage Rolex Submariner 1680 from 1978, excellent condition with original box and papers. This timepiece features a black dial, stainless steel case, and original bezel insert.",
                current_bid: 12500,
                starting_bid: 8000,
                buy_now_price: 15000,
                end_time: "2024-12-31T23:59:59",
                active_bidders: 18,
                total_bids: 42,
                image_url: "/public/golden.png",
                category: "Luxury Watches",
                seller: {
                    username: "LuxuryCollector",
                    rating: 4.9,
                    sales: 124
                }
            };

            const mockBids = [
                { id: 1, bidAmount: 12500, bidder: { username: "WatchEnthusiast" }, createdAt: "2024-12-20T14:30:00" },
                { id: 2, bidAmount: 12400, bidder: { username: "CollectorPro" }, createdAt: "2024-12-20T14:25:00" },
                { id: 3, bidAmount: 12200, bidder: { username: "VintageLover" }, createdAt: "2024-12-20T14:20:00" },
                { id: 4, bidAmount: 12000, bidder: { username: "TimepieceFan" }, createdAt: "2024-12-20T14:15:00" },
                { id: 5, bidAmount: 11800, bidder: { username: "LuxuryBuyer" }, createdAt: "2024-12-20T14:10:00" },
                { id: 6, bidAmount: 11500, bidder: { username: "WatchCollector" }, createdAt: "2024-12-20T14:05:00" },
                { id: 7, bidAmount: 11200, bidder: { username: "PremiumBidder" }, createdAt: "2024-12-20T14:00:00" },
                { id: 8, bidAmount: 11000, bidder: { username: "VintageHunter" }, createdAt: "2024-12-20T13:55:00" },
            ];

            setAuction(mockAuction);
            setBids(mockBids);
            updateTimeRemaining(mockAuction.end_time);
            startTimer(mockAuction.end_time);
            setBidAmount((mockAuction.current_bid + 100).toString());
            
            // Generate active bidders
            const bidders = generateActiveBidders(mockAuction);
            setActiveBidders(bidders);
            
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
                const newBid = {
                    id: Date.now(),
                    bidAmount: data.bidAmount,
                    bidder: { username: data.bidder || 'Anonymous' },
                    createdAt: new Date().toISOString()
                };
                
                setBids(prev => [newBid, ...prev]);
                setAuction(prev => prev ? { ...prev, current_bid: data.bidAmount, total_bids: prev.total_bids + 1 } : null);
                
                // Scroll bid history to top
                if (bidHistoryRef.current) {
                    bidHistoryRef.current.scrollTop = 0;
                }
                
                toast.info(`New bid: ${formatCurrency(data.bidAmount)} by ${data.bidder || 'Anonymous'}`);
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
            setTimeRemaining('00:00:00');
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
            setTimeRemaining(`${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`);
        } else {
            setTimeRemaining(`${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`);
        }
    };

    const generateActiveBidders = (auctionData) => {
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
                id: i + 1,
                name: bidderNames[i],
                status: statuses[i % statuses.length],
                lastBid: baseBid + (bidIncrement * (i + 1)),
                lastActive: timeAgo[i % timeAgo.length],
                isOnline: i < 3 // First 3 bidders are online
            });
        }
        
        // Sort by last bid (highest first)
        return bidders.sort((a, b) => b.lastBid - a.lastBid);
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
                setBidAmount((bidValue + bidIncrement).toString());
            }
        } catch (error) {
            console.error('Error placing bid:', error);
            toast.error('Failed to place bid');
        }
    };

    const handleQuickBid = (increment) => {
        if (!auction) return;
        const newBid = auction.current_bid + increment;
        setBidAmount(newBid.toString());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading auction details...</p>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction not found</h2>
                    <button 
                        onClick={() => navigate('/auctions')}
                        className="btn btn-primary"
                    >
                        Back to Auctions
                    </button>
                </div>
            </div>
        );
    }

    const isTimeCritical = timeRemaining.includes(':') && timeRemaining.split(':')[0] === '00' && parseInt(timeRemaining.split(':')[1]) < 10;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb and Back */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate('/auctions')}
                        className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        <FiChevronLeft className="w-5 h-5 mr-1" />
                        Back to Auctions
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Product Images */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                            <div className="relative h-96">
                                <img 
                                    src={auction.image_url} 
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {auction.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <button 
                                        onClick={() => setIsWatching(!isWatching)}
                                        className={`p-2 rounded-full ${isWatching ? 'bg-red-100 text-red-600' : 'bg-white/90 text-gray-600'} backdrop-blur-sm`}
                                    >
                                        <FiHeart className={`w-5 h-5 ${isWatching ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
                            <p className="text-gray-600 mb-6">{auction.description}</p>
                            
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {auction.seller.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{auction.seller.username}</div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <span>⭐ {auction.seller.rating}/5</span>
                                            <span>•</span>
                                            <span>{auction.seller.sales} sales</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Bidding Panel */}
                    <div className="lg:col-span-1">
                        {/* Timer Card */}
                        <div className={`bg-gradient-to-r ${isTimeCritical ? 'from-red-500 to-red-600' : 'from-primary-500 to-secondary-500'} text-white rounded-2xl shadow-lg p-6 mb-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <FiClock className="w-5 h-5" />
                                    <span className="font-medium">Auction Ends In</span>
                                </div>
                                {isAuctionEnded && (
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Ended</span>
                                )}
                            </div>
                            <div className="text-4xl font-bold font-mono text-center mb-2">
                                {timeRemaining}
                            </div>
                            <div className="text-center text-white/80 text-sm">
                                {isTimeCritical ? 'Hurry! Bidding ends soon' : 'Time is running out'}
                            </div>
                        </div>

                        {/* Current Bid Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-sm text-gray-500">Current Bid</div>
                                    <div className="text-3xl font-bold text-primary-600">
                                        {formatCurrency(auction.current_bid)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Starting Bid</div>
                                    <div className="text-lg font-semibold text-gray-700">
                                        {formatCurrency(auction.starting_bid)}
                                    </div>
                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-medium">
                                        {isConnected ? 'Live Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <FiUsers className="w-4 h-4" />
                                    <span>{auction.active_bidders} active bidders</span>
                                </div>
                            </div>

                            {/* Bid Input */}
                            {!isAuctionEnded && (
                                <>
                                    <div className="mb-6">
                                        <label className="form-label">Your Bid Amount</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                                                $
                                            </div>
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 text-lg font-bold border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                min={auction.current_bid + bidIncrement}
                                                step={bidIncrement}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>Min: {formatCurrency(auction.current_bid + bidIncrement)}</span>
                                            <span>Increment: ${bidIncrement}</span>
                                        </div>
                                    </div>

                                    {/* Quick Bid Buttons */}
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <button 
                                            onClick={() => handleQuickBid(100)}
                                            className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                        >
                                            +$100
                                        </button>
                                        <button 
                                            onClick={() => handleQuickBid(500)}
                                            className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                        >
                                            +$500
                                        </button>
                                        <button 
                                            onClick={() => handleQuickBid(1000)}
                                            className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                        >
                                            +$1K
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handlePlaceBid}
                                            disabled={!isConnected}
                                            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <HiOutlineLightningBolt className="w-5 h-5" />
                                            <span>Place Bid Now</span>
                                        </button>

                                        {auction.buy_now_price && (
                                            <button
                                                onClick={() => {
                                                    setBidAmount(auction.buy_now_price.toString());
                                                    toast.info(`Buy Now price set to ${formatCurrency(auction.buy_now_price)}`);
                                                }}
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-200"
                                            >
                                                ⚡ Buy Now: {formatCurrency(auction.buy_now_price)}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {isAuctionEnded && (
                                <div className="text-center py-6">
                                    <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Auction Ended</h3>
                                    <p className="text-gray-600">This auction is no longer accepting bids.</p>
                                </div>
                            )}
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <FiTrendingUp className="w-4 h-4" />
                                        <span>Total Bids</span>
                                    </div>
                                    <span className="font-bold">{auction.total_bids}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <FiUsers className="w-4 h-4" />
                                        <span>Active Bidders</span>
                                    </div>
                                    <span className="font-bold">{auction.active_bidders}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <HiOutlineFire className="w-4 h-4" />
                                        <span>Bid Increment</span>
                                    </div>
                                    <span className="font-bold">${bidIncrement}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <FiActivity className="w-4 h-4" />
                                        <span>Activity</span>
                                    </div>
                                    <span className="font-bold text-green-600">High</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bid History and Active Bidders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Bid History */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Bid History</h3>
                            <span className="text-sm text-gray-500">{bids.length} bids</span>
                        </div>
                        
                        <div 
                            ref={bidHistoryRef}
                            className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
                        >
                            {bids.map((bid) => (
                                <div 
                                    key={bid.id} 
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {bid.bidder.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{bid.bidder.username}</div>
                                            <div className="text-sm text-gray-500">{formatDate(bid.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary-600">
                                            {formatCurrency(bid.bidAmount)}
                                        </div>
                                        {bid.bidAmount === auction.current_bid && (
                                            <div className="text-xs text-green-600 font-medium flex items-center justify-end">
                                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                                Current Highest
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Bidders */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Active Bidders</h3>
                            <span className="text-sm text-gray-500">{activeBidders.length} online</span>
                        </div>
                        
                        <div className="space-y-3">
                            {activeBidders.map((bidder) => (
                                <div 
                                    key={bidder.id} 
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {bidder.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {bidder.isOnline && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{bidder.name}</div>
                                            <div className="text-sm text-gray-500">{bidder.status}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            {formatCurrency(bidder.lastBid)}
                                        </div>
                                        <div className="text-xs text-gray-500">{bidder.lastActive}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAuction;