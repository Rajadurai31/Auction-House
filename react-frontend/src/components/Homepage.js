import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiTrendingUp, FiFire, FiStar, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineLightningBolt } from 'react-icons/hi';

const Homepage = () => {
    const [featuredAuctions, setFeaturedAuctions] = useState([]);
    const [trendingAuctions, setTrendingAuctions] = useState([]);
    const [endingSoonAuctions, setEndingSoonAuctions] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    // Mock data - in real app, this would come from API
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setFeaturedAuctions([
                {
                    id: 1,
                    title: "Vintage Rolex Submariner",
                    image: "/public/golden.png",
                    currentBid: 12500,
                    startingBid: 8000,
                    endTime: "2024-12-31T23:59:59",
                    bids: 42,
                    bidders: 18,
                    category: "Jewelry"
                },
                {
                    id: 2,
                    title: "Tesla Model S 2023",
                    image: "/public/car.webp",
                    currentBid: 65000,
                    startingBid: 50000,
                    endTime: "2024-12-25T18:00:00",
                    bids: 89,
                    bidders: 32,
                    category: "Vehicles"
                },
                {
                    id: 3,
                    title: "Original Picasso Painting",
                    image: "/public/painting.webp",
                    currentBid: 2500000,
                    startingBid: 2000000,
                    endTime: "2024-12-28T12:00:00",
                    bids: 15,
                    bidders: 8,
                    category: "Art"
                }
            ]);

            setTrendingAuctions([
                {
                    id: 4,
                    title: "iPhone 15 Pro Max 1TB",
                    image: "/public/Rare mobile.webp",
                    currentBid: 1800,
                    startingBid: 1200,
                    endTime: "2024-12-20T15:30:00",
                    bids: 156,
                    bidders: 64,
                    category: "Electronics"
                },
                {
                    id: 5,
                    title: "Designer Wedding Dress",
                    image: "/public/dress.webp",
                    currentBid: 3200,
                    startingBid: 2000,
                    endTime: "2024-12-22T20:00:00",
                    bids: 78,
                    bidders: 29,
                    category: "Fashion"
                },
                {
                    id: 6,
                    title: "Rare Sports Bike",
                    image: "/public/bike.webp",
                    currentBid: 8500,
                    startingBid: 6000,
                    endTime: "2024-12-24T14:00:00",
                    bids: 112,
                    bidders: 45,
                    category: "Sports"
                }
            ]);

            setEndingSoonAuctions([
                {
                    id: 7,
                    title: "Limited Edition Sneakers",
                    image: "/public/shoe.webp",
                    currentBid: 1200,
                    startingBid: 800,
                    endTime: "2024-12-15T10:00:00",
                    bids: 45,
                    bidders: 22,
                    category: "Fashion"
                },
                {
                    id: 8,
                    title: "Antique Gold Watch",
                    image: "/public/item1.jpg",
                    currentBid: 4500,
                    startingBid: 3000,
                    endTime: "2024-12-16T16:30:00",
                    bids: 32,
                    bidders: 18,
                    category: "Jewelry"
                },
                {
                    id: 9,
                    title: "Modern Art Sculpture",
                    image: "/public/item2.jpg",
                    currentBid: 8500,
                    startingBid: 6000,
                    endTime: "2024-12-17T12:00:00",
                    bids: 28,
                    bidders: 15,
                    category: "Art"
                }
            ]);

            setLoading(false);
        }, 1000);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateTimeLeft = (endTime) => {
        const end = new Date(endTime);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredAuctions.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredAuctions.length) % featuredAuctions.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Discover Amazing Auctions
                            <span className="block text-accent-300">Win Your Dream Items</span>
                        </h1>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of bidders in our premium online auction marketplace. 
                            From luxury watches to rare collectibles, find something extraordinary.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                to="/auctions" 
                                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>Browse Auctions</span>
                                <FiArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                to="/sell" 
                                className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                            >
                                Sell Your Item
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600">10,000+</div>
                            <div className="text-gray-600">Active Auctions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-secondary-600">$50M+</div>
                            <div className="text-gray-600">Total Value</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-accent-600">25,000+</div>
                            <div className="text-gray-600">Happy Bidders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">98%</div>
                            <div className="text-gray-600">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Auctions Carousel */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Featured Auctions</h2>
                        <p className="text-gray-600 mt-2">Premium items with exceptional value</p>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={prevSlide}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div className="overflow-hidden rounded-2xl">
                        <div 
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {featuredAuctions.map((auction) => (
                                <div key={auction.id} className="w-full flex-shrink-0">
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                                        <div className="grid md:grid-cols-2 gap-8 p-8">
                                            <div className="relative">
                                                <div className="aspect-square rounded-xl overflow-hidden">
                                                    <img 
                                                        src={auction.image} 
                                                        alt={auction.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                        {auction.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-white flex flex-col justify-center">
                                                <h3 className="text-3xl font-bold mb-4">{auction.title}</h3>
                                                <div className="space-y-4 mb-6">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300">Current Bid</span>
                                                        <span className="text-2xl font-bold text-accent-300">
                                                            {formatCurrency(auction.currentBid)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300">Starting Bid</span>
                                                        <span className="text-lg">{formatCurrency(auction.startingBid)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300">Time Left</span>
                                                        <span className="text-lg font-semibold text-red-300 flex items-center space-x-1">
                                                            <FiClock className="w-4 h-4" />
                                                            <span>{calculateTimeLeft(auction.endTime)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 mb-6">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{auction.bids}</div>
                                                        <div className="text-sm text-gray-300">Bids</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{auction.bidders}</div>
                                                        <div className="text-sm text-gray-300">Bidders</div>
                                                    </div>
                                                </div>
                                                <Link 
                                                    to={`/auctions/${auction.id}`}
                                                    className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors text-center"
                                                >
                                                    Place Your Bid
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Auctions */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <FiTrendingUp className="w-8 h-8 text-primary-600" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                            <p className="text-gray-600 mt-2">Most popular auctions this week</p>
                        </div>
                    </div>
                    <Link 
                        to="/trending" 
                        className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1"
                    >
                        <span>View All</span>
                        <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingAuctions.map((auction) => (
                        <div key={auction.id} className="auction-card">
                            <div className="relative">
                                <div className="auction-image">
                                    <img src={auction.image} alt={auction.title} />
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="badge badge-danger flex items-center space-x-1">
                                        <FiFire className="w-3 h-3" />
                                        <span>Trending</span>
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="badge badge-primary">{auction.category}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{auction.title}</h3>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Current Bid</span>
                                        <span className="font-bold text-lg text-primary-600">
                                            {formatCurrency(auction.currentBid)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Time Left</span>
                                        <span className="font-semibold text-red-600 flex items-center space-x-1">
                                            <FiClock className="w-4 h-4" />
                                            <span>{calculateTimeLeft(auction.endTime)}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <span>👤 {auction.bidders} bidders</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span>🏷️ {auction.bids} bids</span>
                                    </div>
                                </div>
                                <Link 
                                    to={`/auctions/${auction.id}`}
                                    className="btn btn-primary w-full"
                                >
                                    Bid Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ending Soon Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <FiClock className="w-8 h-8 text-red-600" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Ending Soon</h2>
                            <p className="text-gray-600 mt-2">Don't miss these last-minute opportunities</p>
                        </div>
                    </div>
                    <Link 
                        to="/ending-soon" 
                        className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1"
                    >
                        <span>View All</span>
                        <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {endingSoonAuctions.map((auction) => (
                        <div key={auction.id} className="auction-card border-2 border-red-200">
                            <div className="relative">
                                <div className="auction-image">
                                    <img src={auction.image} alt={auction.title} />
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="badge badge-danger animate-pulse">
                                        Ending Soon
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{auction.title}</h3>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Current Bid</span>
                                        <span className="font-bold text-lg text-primary-600">
                                            {formatCurrency(auction.currentBid)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Time Left</span>
                                        <span className="font-bold text-red-600 timer-critical">
                                            {calculateTimeLeft(auction.endTime)}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(auction.bids / 50) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{auction.bids} bids placed</span>
                                        <span>{auction.bidders} active bidders</span>
                                    </div>
                                </div>
                                <Link 
                                    to={`/auctions/${auction.id}`}
                                    className="btn btn-danger w-full"
                                >
                                    <HiOutlineLightningBolt className="w-5 h-5 mr-2" />
                                    Quick Bid
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Bidding?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Join our community of passionate bidders and discover amazing deals on unique items.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register" 
                            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                        >
                            Create Free Account
                        </Link>
                        <Link 
                            to="/how-it-works" 
                            className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { name: 'Electronics', icon: '📱', count: 1245 },
                        { name: 'Vehicles', icon: '🚗', count: 567 },
                        { name: 'Fashion', icon: '👕', count: 2345 },
                        { name: 'Art', icon: '🎨', count: 789 },
                        { name: 'Jewelry', icon: '💎', count: 1234 },
                        { name: 'Home', icon: '🏠', count: 1890 },
                        { name: 'Sports', icon: '⚽', count: 678 },
                        { name: 'Antiques', icon: '🏺', count: 456 },
                        { name: 'Collectibles', icon: '🌟', count: 901 },
                        { name: 'Watches', icon: '⌚', count: 1123 },
                        { name: 'Real Estate', icon: '🏡', count: 234 },
                        { name: 'Experiences', icon: '🎭', count: 345 },
                    ].map((category) => (
                        <Link 
                            key={category.name}
                            to={`/category/${category.name.toLowerCase()}`}
                            className="bg-white rounded-xl p-4 text-center hover:shadow-card-hover transition-all duration-200 border border-gray-100"
                        >
                            <div className="text-3xl mb-2">{category.icon}</div>
                            <div className="font-semibold text-gray-800 mb-1">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.count.toLocaleString()} items</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Homepage;