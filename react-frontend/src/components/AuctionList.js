import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import sampleProducts from '../data/sampleProducts';

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'ended'
    const [cart, setCart] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchAuctions();
        // Load cart and watchlist from localStorage
        const savedCart = localStorage.getItem('auctionCart');
        const savedWatchlist = localStorage.getItem('auctionWatchlist');
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
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
            
            if (data.success && data.auctions && data.auctions.length > 0) {
                setAuctions(data.auctions);
            } else {
                // Use sample products if no auctions from API
                const productsWithCartStatus = sampleProducts.map(product => ({
                    ...product,
                    _id: product.id,
                    image_url: product.image,
                    starting_bid: product.startingBid,
                    current_bid: product.currentBid,
                    end_time: product.endTime.toISOString(),
                    total_bids: product.totalBids,
                    active_bidders: product.activeBidders,
                    inCart: cart.some(item => item.id === product.id),
                    inWatchlist: watchlist.some(item => item.id === product.id)
                }));
                setAuctions(productsWithCartStatus);
            }
        } catch (error) {
            console.error('Error fetching auctions:', error);
            // Use sample products on error
            const productsWithCartStatus = sampleProducts.map(product => ({
                ...product,
                _id: product.id,
                image_url: product.image,
                starting_bid: product.startingBid,
                current_bid: product.currentBid,
                end_time: product.endTime.toISOString(),
                total_bids: product.totalBids,
                active_bidders: product.activeBidders,
                inCart: cart.some(item => item.id === product.id),
                inWatchlist: watchlist.some(item => item.id === product.id)
            }));
            setAuctions(productsWithCartStatus);
            toast.info('Using sample auction products');
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

    const addToCart = (product) => {
        const productToAdd = {
            id: product._id || product.id,
            title: product.title,
            image: product.image_url || product.image,
            currentBid: product.current_bid || product.currentBid,
            endTime: product.end_time || product.endTime,
            quantity: 1
        };
        
        const newCart = [...cart, productToAdd];
        setCart(newCart);
        localStorage.setItem('auctionCart', JSON.stringify(newCart));
        
        // Update auction inCart status
        setAuctions(prev => prev.map(auction => 
            auction._id === product._id ? { ...auction, inCart: true } : auction
        ));
        
        toast.success(`${product.title} added to cart!`);
    };

    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('auctionCart', JSON.stringify(newCart));
        
        // Update auction inCart status
        setAuctions(prev => prev.map(auction => 
            auction._id === productId ? { ...auction, inCart: false } : auction
        ));
        
        toast.info('Item removed from cart');
    };

    const toggleWatchlist = (product) => {
        const productId = product._id || product.id;
        const isInWatchlist = watchlist.some(item => item.id === productId);
        
        if (isInWatchlist) {
            const newWatchlist = watchlist.filter(item => item.id !== productId);
            setWatchlist(newWatchlist);
            localStorage.setItem('auctionWatchlist', JSON.stringify(newWatchlist));
            
            // Update auction watchlist status
            setAuctions(prev => prev.map(auction => 
                auction._id === productId ? { ...auction, inWatchlist: false } : auction
            ));
            
            toast.info(`${product.title} removed from watchlist`);
        } else {
            const productToAdd = {
                id: productId,
                title: product.title,
                image: product.image_url || product.image,
                currentBid: product.current_bid || product.currentBid,
                endTime: product.end_time || product.endTime
            };
            
            const newWatchlist = [...watchlist, productToAdd];
            setWatchlist(newWatchlist);
            localStorage.setItem('auctionWatchlist', JSON.stringify(newWatchlist));
            
            // Update auction watchlist status
            setAuctions(prev => prev.map(auction => 
                auction._id === productId ? { ...auction, inWatchlist: true } : auction
            ));
            
            toast.success(`${product.title} added to watchlist!`);
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.currentBid, 0);
    };

    const proceedToCheckout = () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        toast.success(`Proceeding to checkout with ${cart.length} items. Total: ${formatCurrency(getCartTotal())}`);
        // In a real app, this would navigate to checkout page
    };

    return (
        <div className="auction-list-container">
            <div className="auction-header">
                <div className="header-left">
                    <h1>Live Auctions Marketplace</h1>
                    <p className="subtitle">Bid on exclusive items with e-commerce style cart</p>
                </div>
                <div className="header-right">
                    <div className="cart-summary">
                        <div className="cart-info">
                            <span className="cart-icon">🛒</span>
                            <span className="cart-count">{cart.length} items</span>
                            <span className="cart-total">{formatCurrency(getCartTotal())}</span>
                        </div>
                        {cart.length > 0 && (
                            <button 
                                className="btn btn-primary checkout-btn"
                                onClick={proceedToCheckout}
                            >
                                Checkout
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="filter-section">
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
                <div className="stats-summary">
                    <span className="stat-item">📊 {auctions.length} Products</span>
                    <span className="stat-item">👥 {auctions.reduce((sum, a) => sum + (a.active_bidders || 0), 0)} Active Bidders</span>
                    <span className="stat-item">🔥 {auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0)} Total Bids</span>
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
                                    src={auction.image_url || auction.image} 
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
                                <div className="action-buttons">
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
                                    
                                    <div className="ecommerce-actions">
                                        <button 
                                            className={`cart-btn ${auction.inCart ? 'in-cart' : ''}`}
                                            onClick={() => auction.inCart ? removeFromCart(auction._id) : addToCart(auction)}
                                            title={auction.inCart ? 'Remove from cart' : 'Add to cart'}
                                        >
                                            {auction.inCart ? '🛒 Remove' : '🛒 Add to Cart'}
                                        </button>
                                        
                                        <button 
                                            className={`watchlist-btn ${auction.inWatchlist ? 'in-watchlist' : ''}`}
                                            onClick={() => toggleWatchlist(auction)}
                                            title={auction.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                                        >
                                            {auction.inWatchlist ? '⭐ Saved' : '⭐ Watch'}
                                        </button>
                                        
                                        {auction.buyNowPrice && (
                                            <button 
                                                className="buy-now-btn"
                                                onClick={() => toast.success(`Buy Now clicked for ${auction.title} at ${formatCurrency(auction.buyNowPrice)}`)}
                                            >
                                                💳 Buy Now
                                            </button>
                                        )}
                                    </div>
                                </div>
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