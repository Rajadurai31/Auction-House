// API utility functions for frontend
const API_BASE_URL = 'http://localhost:3003/api';

// Store token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    async register(username, password) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) {
            setAuthToken(data.token);
        }
        return data;
    },

    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) {
            setAuthToken(data.token);
        }
        return data;
    },

    async verify() {
        return await apiRequest('/auth/verify');
    },

    logout() {
        removeAuthToken();
    }
};

// Auction API
const auctionAPI = {
    async getAll() {
        return await apiRequest('/auctions');
    },

    async getById(id) {
        return await apiRequest(`/auctions/${id}`);
    }
};

// Bid API
const bidAPI = {
    async placeBid(auctionId, bidAmount) {
        return await apiRequest('/bids', {
            method: 'POST',
            body: JSON.stringify({ auctionId, bidAmount })
        });
    },

    async getAuctionBids(auctionId) {
        return await apiRequest(`/bids/auction/${auctionId}`);
    },

    async getMyBids() {
        return await apiRequest('/bids/my-bids');
    }
};

