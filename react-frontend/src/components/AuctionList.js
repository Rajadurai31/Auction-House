import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiTrendingUp, FiFilter } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi';

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [filter, setFilter] = useState('all'); // all, active, ending, trending
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data - in a real app, this would come from an API
        const mockAuctions = [
            {
                id: 1,
                title: "Vintage Rolex Submariner",
                description: "Rare vintage Rolex Submariner 1680 from 1978, excellent condition",
                currentBid: 12500,
                startingBid: 8000,
                endTime: "2024-12-31T23:59:59",
                bids: 42,
                bidders: 18,
                image: "/public/golden.png",
                category: "Watches",
                timeLeft: "2d 4h",
                isTrending: true,
                isEndingSoon: true
            },
            {
                id: 2,
                title: "Tesla Model S Plaid 2023",
                description: "Fully loaded Tesla Model S Plaid, 2023 model with FSD",
                currentBid: 85000,
                startingBid: 70000,
                endTime: "2024-12-25T18:00:00",
                bids: 89,
                bidders: 32,
                image: "/public/car.webp",
                category: "Vehicles",
                timeLeft: "3d 12h",
                isTrending: true
            },
            {
                id: 3,
                title: "Original Picasso Sketch",
                description: "Original pencil sketch by Pablo Picasso, 1965",
                currentBid: 250000,
                startingBid: 200000,
                endTime: "2024-12-28T12:00:00",
                bids: 15,
                bidders: 8,
                image: "/public/painting.webp",
                category: "Art",
                timeLeft: "5d 6h",
                isEndingSoon: true
            },
            {
                id: 4,
                title: "Limited Edition Sneakers",
                description: "Nike Air Jordan 1 Retro High OG, Size 10",
                currentBid: 1200,
                startingBid: 800,
                endTime: "2024-12-15T10:00:00",
                bids: 156,
                bidders: 64,
                image: "/public/shoe.webp",
                category: "Fashion",
                timeLeft: "1d 4h",
                isEndingSoon: true
            },
            {
                id: 5,
                title: "Antique Persian Rug",
                description: "Hand-woven Persian rug, 8x10 ft, 1920s",
                currentBid: 4500,
                startingBid: 3000,
                endTime: "2024-12-20T15:30:00",
                bids: 32,
                bidders: 15,
                image: "/public/item1.jpg",
                category: "Antiques",
                timeLeft: "4d 8h"
            },
            {
                id: 6,
                title: "Rare Whiskey Collection",
                description: "Macallan 50 Year Old Single Malt Scotch",
                currentBid: 25000,
                startingBid: 20000,
                endTime: "2024-12-22T20:00:00",
                bids: 28,
                bidders: 12,
                image: "/public/item2.jpg",
                category: "Collectibles",
                timeLeft: "6d 2h"
            }
        ];

        setAuctions(mockAuctions);
        setLoading(false);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredAuctions = auctions.filter(auction => {
        if (filter === 'all') return true;
        if (filter === 'trending') return auction.isTrending;
        if (filter === 'ending') return auction.isEndingSoon;
        return true;
    }).filter(auction => 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Live Auctions</h1>
                    <p className="text-gray-600">Discover and bid on amazing items from around the world</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search auctions, categories, or sellers..."
                                    className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                All Auctions
                            </button>
                            <button
                                onClick={() => setFilter('trending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === 'trending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <HiOutlineFire className="w-4 h-4" />
                                Trending
                            </button>
                            <button
                                onClick={() => setFilter('ending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === 'ending' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <FiClock className="w-4 h-4" />
                                Ending Soon
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{auctions.length}</div>
                        <div className="text-sm text-gray-500">Active Auctions</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">$2.4M+</div>
                        <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">1,234</div>
                        <div className="text-sm text-gray-500">Active Bidders</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">98%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                </div>

                {/* Auction Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map((auction) => (
                        <div key={auction.id} className="auction-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={auction.image} 
                                        alt={auction.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <div className="absolute top-3 right-3">
                                    {auction.isTrending && (
                                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                            <HiOutlineFire className="w-4 h-4" />
                                            Trending
                                        </span>
                                    )}
                                    {auction.isEndingSoon && (
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Ending Soon
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        {auction.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                        {auction.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">{auction.timeLeft} left</span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {auction.description}
                                </p>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Current Bid</span>
                                        <span className="text-xl font-bold text-primary-600">
                                            {formatCurrency(auction.currentBid)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <FiUsers className="w-4 h-4" />
                                            <span>{auction.bidders} bidders</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <FiClock className="w-4 h-4" />
                                            <span>{auction.bids} bids</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-primary-600 h-2 rounded-full" 
                                            style={{ width: `${Math.min(100, (auction.bids / 200) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Link 
                                        to={`/auctions/${auction.id}`}
                                        className="flex-1 bg-primary-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                                    >
                                        Place Bid
                                    </Link>
                                    <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <FiClock className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAuctions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No auctions found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionList;