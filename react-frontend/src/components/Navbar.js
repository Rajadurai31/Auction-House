import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { FiSearch, FiUser, FiShoppingCart, FiBell, FiMenu, FiX, FiHome, FiTrendingUp, FiClock } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isConnected } = useWebSocket();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/auctions?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const cartItems = 3; // Mock cart items count
    const notifications = 2; // Mock notifications count

    return (
        <nav className="navbar">
            <div className="container mx-auto px-4">
                {/* Top Bar */}
                <div className="hidden md:flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Live Bidding Active' : 'Connection Lost'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/trending" className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1">
                                <HiOutlineFire className="w-4 h-4" />
                                <span>Trending</span>
                            </Link>
                            <Link to="/ending-soon" className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1">
                                <FiClock className="w-4 h-4" />
                                <span>Ending Soon</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600">Welcome, <span className="font-semibold text-primary-600">{user?.username}</span></span>
                                <button 
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">
                                    Sign In
                                </Link>
                                <Link to="/register" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Navbar */}
                <div className="py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-8">
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-gray-600 hover:text-primary-600"
                            >
                                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                            </button>
                            
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">AH</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                        AuctionHouse
                                    </h1>
                                    <p className="text-xs text-gray-500">Premium Online Auctions</p>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-6">
                                <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1">
                                    <FiHome className="w-4 h-4" />
                                    <span>Home</span>
                                </Link>
                                <Link to="/auctions" className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1">
                                    <FiTrendingUp className="w-4 h-4" />
                                    <span>All Auctions</span>
                                </Link>
                                <Link to="/categories" className="text-gray-700 hover:text-primary-600 font-medium">
                                    Categories
                                </Link>
                                <Link to="/sell" className="text-gray-700 hover:text-primary-600 font-medium">
                                    Sell Item
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:block flex-1 max-w-2xl mx-8">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for auctions, categories, or sellers..."
                                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                />
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Mobile Search */}
                            <button className="md:hidden text-gray-600 hover:text-primary-600">
                                <FiSearch className="w-6 h-6" />
                            </button>

                            {/* Cart */}
                            <Link to="/cart" className="relative text-gray-600 hover:text-primary-600">
                                <FiShoppingCart className="w-6 h-6" />
                                {cartItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItems}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications */}
                            <button className="relative text-gray-600 hover:text-primary-600">
                                <FiBell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </button>

                            {/* User Profile */}
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden lg:inline font-medium">{user?.username}</span>
                                </Link>
                            ) : (
                                <Link to="/login" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                                    <FiUser className="w-6 h-6" />
                                    <span className="hidden lg:inline">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className={`md:hidden mt-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search auctions..."
                                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </form>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden mt-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                        <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
                            <Link to="/" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Home
                            </Link>
                            <Link to="/auctions" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                All Auctions
                            </Link>
                            <Link to="/categories" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Categories
                            </Link>
                            <Link to="/sell" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Sell Item
                            </Link>
                            <Link to="/trending" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Trending
                            </Link>
                            <Link to="/ending-soon" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Ending Soon
                            </Link>
                            
                            <div className="pt-3 border-t border-gray-200">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                            My Dashboard
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                                            Sign In
                                        </Link>
                                        <Link to="/register" className="block py-2 text-primary-600 hover:text-primary-700 font-medium">
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Bar */}
                <div className="hidden md:block border-t border-b border-gray-200 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 overflow-x-auto custom-scrollbar">
                            <Link to="/category/electronics" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                📱 Electronics
                            </Link>
                            <Link to="/category/vehicles" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                🚗 Vehicles
                            </Link>
                            <Link to="/category/fashion" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                👕 Fashion
                            </Link>
                            <Link to="/category/art" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                🎨 Art & Collectibles
                            </Link>
                            <Link to="/category/home" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                🏠 Home & Garden
                            </Link>
                            <Link to="/category/jewelry" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                💎 Jewelry
                            </Link>
                            <Link to="/category/sports" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                ⚽ Sports
                            </Link>
                            <Link to="/category/antiques" className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">
                                🏺 Antiques
                            </Link>
                        </div>
                        <Link to="/all-categories" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View All →
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;