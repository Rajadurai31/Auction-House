import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isConnected } = useWebSocket();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="logo-link">
                        <span className="logo-icon">🏷️</span>
                        <span className="logo-text">Auction House</span>
                    </Link>
                </div>

                <div className="navbar-middle">
                    <div className="connection-status">
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        <span className="status-text">
                            {isConnected ? 'Live Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="navbar-menu">
                    <ul className="nav-links">
                        <li>
                            <Link to="/auctions" className="nav-link">
                                Auctions
                            </Link>
                        </li>
                        
                        {isAuthenticated ? (
                            <>
                                <li className="user-info">
                                    <span className="username">
                                        👤 {user?.username}
                                    </span>
                                </li>
                                <li>
                                    <button 
                                        onClick={handleLogout}
                                        className="btn btn-logout"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="nav-link">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="btn btn-register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;