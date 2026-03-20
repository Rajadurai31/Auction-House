import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">AH</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">AuctionHouse</h2>
                                <p className="text-gray-400 text-sm">Premium Online Auctions</p>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Discover amazing auctions and win unique items from around the world. 
                            Join our community of passionate bidders.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiLinkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/auctions" className="text-gray-400 hover:text-white transition-colors">
                                    Browse Auctions
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/trending" className="text-gray-400 hover:text-white transition-colors">
                                    Trending
                                </Link>
                            </li>
                            <li>
                                <Link to="/ending-soon" className="text-gray-400 hover:text-white transition-colors">
                                    Ending Soon
                                </Link>
                            </li>
                            <li>
                                <Link to="/sell" className="text-gray-400 hover:text-white transition-colors">
                                    Sell Your Item
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Help & Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                                    Customer Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                                <span className="text-gray-400">
                                    123 Auction Street,<br />
                                    New York, NY 10001
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiPhone className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiMail className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">support@auctionhouse.com</span>
                            </li>
                        </ul>
                        
                        {/* Newsletter */}
                        <div className="mt-8">
                            <h4 className="text-sm font-semibold mb-3">NEWSLETTER</h4>
                            <p className="text-gray-400 text-sm mb-3">
                                Subscribe to get updates on new auctions
                            </p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r-lg font-medium transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © {new Date().getFullYear()} AuctionHouse. All rights reserved.
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                                Cookie Policy
                            </Link>
                            <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;