// Simple script to view database data
const { getDatabase } = require('./database');

const db = getDatabase();

console.log('\n=== AUCTION HOUSE DATABASE VIEWER ===\n');

// View Users
db.all('SELECT id, username, created_at FROM users', [], (err, users) => {
    if (err) {
        console.error('Error fetching users:', err);
    } else {
        console.log('📋 USERS TABLE:');
        console.log('─'.repeat(60));
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user.id} | Username: ${user.username} | Created: ${user.created_at}`);
            });
        }
        console.log(`Total Users: ${users.length}\n`);
    }

    // View Auctions
    db.all('SELECT * FROM auctions ORDER BY created_at DESC', [], (err, auctions) => {
        if (err) {
            console.error('Error fetching auctions:', err);
        } else {
            console.log('🏛️ AUCTIONS TABLE:');
            console.log('─'.repeat(60));
            if (auctions.length === 0) {
                console.log('No auctions found.');
            } else {
                auctions.forEach(auction => {
                    const endTime = new Date(auction.end_time);
                    const now = new Date();
                    const isActive = endTime > now ? 'ACTIVE' : 'ENDED';
                    console.log(`\nID: ${auction.id}`);
                    console.log(`Title: ${auction.title}`);
                    console.log(`Current Bid: ₹${auction.current_bid.toLocaleString('en-IN')}`);
                    console.log(`Buy Now Price: ₹${auction.buy_now_price.toLocaleString('en-IN')}`);
                    console.log(`Status: ${auction.status} | ${isActive}`);
                    console.log(`End Time: ${auction.end_time}`);
                    console.log(`Created: ${auction.created_at}`);
                });
            }
            console.log(`\nTotal Auctions: ${auctions.length}\n`);
        }

        // View Bids
        db.all(`
            SELECT 
                b.id,
                b.auction_id,
                a.title as auction_title,
                u.username,
                b.bid_amount,
                b.bid_time
            FROM bids b
            JOIN auctions a ON b.auction_id = a.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.bid_time DESC
        `, [], (err, bids) => {
            if (err) {
                console.error('Error fetching bids:', err);
            } else {
                console.log('💰 BIDS TABLE:');
                console.log('─'.repeat(60));
                if (bids.length === 0) {
                    console.log('No bids found.');
                } else {
                    bids.forEach(bid => {
                        console.log(`\nBid ID: ${bid.id}`);
                        console.log(`Auction: ${bid.auction_title} (ID: ${bid.auction_id})`);
                        console.log(`User: ${bid.username}`);
                        console.log(`Amount: ₹${bid.bid_amount.toLocaleString('en-IN')}`);
                        console.log(`Time: ${bid.bid_time}`);
                    });
                }
                console.log(`\nTotal Bids: ${bids.length}\n`);
            }

            // Summary Statistics
            db.get('SELECT COUNT(*) as count FROM users', [], (err, userCount) => {
                db.get('SELECT COUNT(*) as count FROM auctions', [], (err, auctionCount) => {
                    db.get('SELECT COUNT(*) as count FROM bids', [], (err, bidCount) => {
                        db.get('SELECT SUM(current_bid) as total FROM auctions', [], (err, totalValue) => {
                            console.log('📊 SUMMARY STATISTICS:');
                            console.log('─'.repeat(60));
                            console.log(`Total Users: ${userCount.count}`);
                            console.log(`Total Auctions: ${auctionCount.count}`);
                            console.log(`Total Bids: ${bidCount.count}`);
                            console.log(`Total Auction Value: ₹${(totalValue.total || 0).toLocaleString('en-IN')}`);
                            console.log('─'.repeat(60));
                            
                            db.close((err) => {
                                if (err) {
                                    console.error('Error closing database:', err);
                                } else {
                                    console.log('\n✅ Database connection closed.\n');
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

