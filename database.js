const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'auction.db');

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
        });

        // Create tables
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
            });

            // Auctions table
            db.run(`CREATE TABLE IF NOT EXISTS auctions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                starting_bid REAL NOT NULL,
                current_bid REAL NOT NULL,
                buy_now_price REAL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME NOT NULL,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating auctions table:', err);
                    reject(err);
                    return;
                }
            });

            // Bids table
            db.run(`CREATE TABLE IF NOT EXISTS bids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                auction_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                bid_amount REAL NOT NULL,
                bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (auction_id) REFERENCES auctions(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) {
                    console.error('Error creating bids table:', err);
                    reject(err);
                    return;
                }
                resolve(db);
            });
        });
    });
}

// Get database instance
function getDatabase() {
    return new sqlite3.Database(DB_PATH);
}

// User operations
const User = {
    async create(username, password) {
        const db = getDatabase();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id: this.lastID, username });
                }
            );
        });
    },

    async findByUsername(username) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    },

    async findById(id) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, created_at FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    },

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};

// Auction operations
const Auction = {
    async getAll() {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM auctions WHERE status = 'active' ORDER BY end_time ASC`,
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    },

    async getById(id) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM auctions WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    },

    async create(auctionData) {
        const db = getDatabase();
        const {
            title,
            description,
            image_url,
            starting_bid,
            current_bid,
            buy_now_price,
            end_time
        } = auctionData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO auctions (title, description, image_url, starting_bid, current_bid, buy_now_price, end_time)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, description, image_url, starting_bid, current_bid, buy_now_price || current_bid * 1.5, end_time],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id: this.lastID, ...auctionData });
                }
            );
        });
    },

    async updateBid(id, newBid) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE auctions SET current_bid = ? WHERE id = ?',
                [newBid, id],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id, current_bid: newBid });
                }
            );
        });
    },

    async updateStatus(id, status) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE auctions SET status = ? WHERE id = ?',
                [status, id],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id, status });
                }
            );
        });
    }
};

// Bid operations
const Bid = {
    async create(auctionId, userId, bidAmount) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)',
                [auctionId, userId, bidAmount],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id: this.lastID, auction_id: auctionId, user_id: userId, bid_amount: bidAmount });
                }
            );
        });
    },

    async getByAuctionId(auctionId) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT b.*, u.username 
                 FROM bids b 
                 JOIN users u ON b.user_id = u.id 
                 WHERE b.auction_id = ? 
                 ORDER BY b.bid_time DESC`,
                [auctionId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    },

    async getUserBids(userId) {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT b.*, a.title as auction_title 
                 FROM bids b 
                 JOIN auctions a ON b.auction_id = a.id 
                 WHERE b.user_id = ? 
                 ORDER BY b.bid_time DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    }
};

module.exports = {
    initDatabase,
    getDatabase,
    User,
    Auction,
    Bid
};

