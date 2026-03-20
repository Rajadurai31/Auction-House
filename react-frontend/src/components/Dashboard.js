import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiSettings, FiBell, FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle, FiShoppingBag, FiHeart, FiEye } from 'react-icons/fi';
import { HiOutlineFire, HiOutlineUserGroup } from 'react-icons/hi';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userStats, setUserStats] = useState({
        totalBids: 42,
        wonAuctions: 8,
        activeBids: 5,
        watchlist: 12,
        totalSpent: 12500,
        savings: 3200
    });

    const [myAuctions, setMyAuctions] = useState([
        {
            id: 1,
            title: "Vintage Camera Collection",
            status: "active",
            currentBid: 1200,
            bids: 15,
            endTime: "2024-12-20T15:30:00",
            image: "/public/item1.jpg"
        },
        {
            id: 2,
            title: "Designer Handbag",
            status: "won",
            currentBid: 850,
            bids: 8,
            endTime: "2024-12-15T10:00:00",
            image: "/public/item2.jpg"
        },
        {
            id: 3,
            title: "Smart Home System",
            status: "active",
            currentBid: 2200,
            bids: 23,
            endTime: "2024-12-25T18:00:00",
            image: "/public/item3.jpg"
        }
    ]);

    const [myBids, setMyBids] = useState([
        {
            id: 1,
            auctionTitle: "Limited Edition Sneakers",
            myBid: 1200,
            currentBid: 1250,
            status: "outbid",
            time: "2 hours ago",
            image: "/public/shoe.webp"
        },
        {
            id: 2,
            auctionTitle: "Antique Watch",
            myBid: 4500,
            currentBid: 4500,
            status: "winning",
            time: "1 day ago",
            image: "/public/golden.png"
        },
        {
            id: 3,
            auctionTitle: "Modern Painting",
            myBid: 3200,
            currentBid: 3100,
            status: "winning",
            time: "3 days ago",
            image: "/public/painting.webp"
        }
    ]);

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
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-600">Manage your auctions, bids, and account</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">JD</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">John Doe</h3>
                                    <p className="text-gray-500 text-sm">Premium Member</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiTrendingUp className="w-5 h-5" />
                                    <span>Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('my-auctions')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'my-auctions' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiPackage className="w-5 h-5" />
                                    <span>My Auctions</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('my-bids')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'my-bids' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiDollarSign className="w-5 h-5" />
                                    <span>My Bids</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('watchlist')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'watchlist' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiHeart className="w-5 h-5" />
                                    <span>Watchlist</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('won-items')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'won-items' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiCheckCircle className="w-5 h-5" />
                                    <span>Won Items</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiSettings className="w-5 h-5" />
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Member Since</span>
                                    <span className="font-semibold">2023</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Trust Score</span>
                                    <span className="font-semibold">98%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Response Rate</span>
                                    <span className="font-semibold">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'overview' && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-primary-100 rounded-lg">
                                                <FiDollarSign className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <span className="text-sm text-gray-500">Total Bids</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{userStats.totalBids}</div>
                                        <div className="text-sm text-gray-500">Active bids: {userStats.activeBids}</div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-100 rounded-lg">
                                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-500">Won Auctions</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{userStats.wonAuctions}</div>
                                        <div className="text-sm text-gray-500">Success rate: 85%</div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-100 rounded-lg">
                                                <FiHeart className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <span className="text-sm text-gray-500">Watchlist</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{userStats.watchlist}</div>
                                        <div className="text-sm text-gray-500">Items saved</div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                        <Link to="/activity" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {myBids.slice(0, 3).map((bid) => (
                                            <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                        <img src={bid.image} alt={bid.auctionTitle} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{bid.auctionTitle}</h4>
                                                        <p className="text-sm text-gray-500">{bid.time}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-semibold ${bid.status === 'winning' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {bid.status === 'winning' ? 'Winning' : 'Outbid'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Your bid: {formatCurrency(bid.myBid)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-sm p-6">
                                        <h3 className="font-bold text-lg mb-4">Start New Auction</h3>
                                        <p className="text-primary-100 mb-6">Sell your items to thousands of bidders</p>
                                        <Link 
                                            to="/sell"
                                            className="inline-block bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            Sell Item Now
                                        </Link>
                                    </div>

                                    <div className="bg-gradient-to-r from-accent-500 to-orange-500 text-white rounded-xl shadow-sm p-6">
                                        <h3 className="font-bold text-lg mb-4">Explore Auctions</h3>
                                        <p className="text-accent-100 mb-6">Discover amazing deals ending soon</p>
                                        <Link 
                                            to="/auctions?filter=ending"
                                            className="inline-block bg-white text-accent-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            View Ending Soon
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'my-auctions' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">My Auctions</h3>
                                    <Link to="/sell" className="btn btn-primary">
                                        Create New Auction
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {myAuctions.map((auction) => (
                                        <div key={auction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{auction.title}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Current bid: {formatCurrency(auction.currentBid)}</span>
                                                        <span>{auction.bids} bids</span>
                                                        <span className="flex items-center">
                                                            <FiClock className="w-4 h-4 mr-1" />
                                                            {calculateTimeLeft(auction.endTime)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {auction.status === 'active' ? 'Active' : 'Won'}
                                                </span>
                                                <Link 
                                                    to={`/auctions/${auction.id}`}
                                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'my-bids' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">My Bids</h3>
                                <div className="space-y-4">
                                    {myBids.map((bid) => (
                                        <div key={bid.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <img src={bid.image} alt={bid.auctionTitle} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{bid.auctionTitle}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Your bid: {formatCurrency(bid.myBid)}</span>
                                                        <span>Current: {formatCurrency(bid.currentBid)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bid.status === 'winning' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {bid.status === 'winning' ? 'Winning' : 'Outbid'}
                                                </span>
                                                <span className="text-sm text-gray-500">{bid.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'watchlist' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">My Watchlist</h3>
                                    <span className="text-gray-500">{userStats.watchlist} items</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src="/public/item1.jpg" alt="Watchlist item" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 mb-1">Vintage Camera</h4>
                                                    <div className="text-sm text-gray-500 mb-2">Current bid: $1,200</div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-red-600 flex items-center">
                                                            <FiClock className="w-4 h-4 mr-1" />
                                                            2d 4h left
                                                        </span>
                                                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'won-items' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Won Items</h3>
                                <div className="space-y-4">
                                    {myAuctions.filter(a => a.status === 'won').map((auction) => (
                                        <div key={auction.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{auction.title}</h4>
                                                    <div className="text-sm text-gray-600">
                                                        Won for {formatCurrency(auction.currentBid)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button className="btn btn-primary">
                                                    Arrange Payment
                                                </button>
                                                <button className="btn btn-outline">
                                                    Contact Seller
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-4">Profile Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="form-label">Full Name</label>
                                                <input type="text" className="form-input" defaultValue="John Doe" />
                                            </div>
                                            <div>
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-input" defaultValue="john@example.com" />
                                            </div>
                                            <div>
                                                <label className="form-label">Phone</label>
                                                <input type="tel" className="form-input" defaultValue="+1 (555) 123-4567" />
                                            </div>
                                            <div>
                                                <label className="form-label">Location</label>
                                                <input type="text" className="form-input" defaultValue="New York, USA" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                                                <span className="ml-2">Email notifications for new bids</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                                                <span className="ml-2">Push notifications for auction ending</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" className="rounded text-primary-600" />
                                                <span className="ml-2">Marketing emails</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button className="btn btn-outline">Cancel</button>
                                        <button className="btn btn-primary">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;