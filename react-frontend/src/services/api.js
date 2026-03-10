// API service for React frontend
const API_BASE_URL = 'http://localhost:3003/api';

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
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
        return data;
    },

    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        return data;
    },

    async verifyToken(token) {
        const data = await apiRequest('/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return data;
    }
};

// Auction API
const auctionAPI = {
    async getAll() {
        return await apiRequest('/auctions');
    },

    async getById(id) {
        return await apiRequest(`/auctions/${id}`);
    },

    async getActive() {
        return await apiRequest('/auctions/active');
    },

    async getEnded() {
        return await apiRequest('/auctions/ended');
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
    },

    async getHighestBid(auctionId) {
        return await apiRequest(`/bids/highest/${auctionId}`);
    },

    async getBidHistory(auctionId) {
        return await apiRequest(`/bids/history/${auctionId}`);
    }
};

// Health check
const healthAPI = {
    async check() {
        return await apiRequest('/health');
    }
};

// Export all APIs
const api = {
    ...authAPI,
    ...auctionAPI,
    ...bidAPI,
    ...healthAPI
};

export default api;