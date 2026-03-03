# How to View Database Data - Step by Step Guide

The database file (`auction.db`) stores all your application data. Here are multiple ways to view it:

---

## Method 1: Using Node.js Script (Easiest - Recommended)

### Step 1: Make sure your server has run at least once
The database file (`auction.db`) will be created in your project folder when you first start the server.

### Step 2: Run the database viewer script
```bash
node view-database.js
```

### Step 3: View the output
The script will display:
- All users
- All auctions with details
- All bids with user and auction information
- Summary statistics

**Example Output:**
```
=== AUCTION HOUSE DATABASE VIEWER ===

📋 USERS TABLE:
────────────────────────────────────────────────────────────
ID: 1 | Username: john_doe | Created: 2025-12-20 10:30:00
Total Users: 1

🏛️ AUCTIONS TABLE:
────────────────────────────────────────────────────────────
ID: 1
Title: Luxury Rolex Watch
Current Bid: ₹85,000
Status: active | ACTIVE
...
```

---

## Method 2: Using DB Browser for SQLite (GUI Tool)

### Step 1: Download DB Browser for SQLite
- Visit: https://sqlitebrowser.org/
- Download and install the application

### Step 2: Open the database file
1. Open DB Browser for SQLite
2. Click **"Open Database"**
3. Navigate to your project folder: `C:\Users\rajad\OneDrive\Desktop\project\`
4. Select `auction.db`
5. Click **"Open"**

### Step 3: View tables
1. Click on the **"Browse Data"** tab
2. Select a table from the dropdown (users, auctions, or bids)
3. View all data in a table format

### Step 4: Run SQL queries (Optional)
1. Click on the **"Execute SQL"** tab
2. Type SQL queries like:
   ```sql
   SELECT * FROM users;
   SELECT * FROM auctions;
   SELECT * FROM bids;
   ```

---

## Method 3: Using SQLite Command Line

### Step 1: Check if SQLite is installed
Open PowerShell or Command Prompt and type:
```bash
sqlite3 --version
```

If not installed:
- Download from: https://www.sqlite.org/download.html
- Or install via: `choco install sqlite` (if you have Chocolatey)

### Step 2: Navigate to your project folder
```bash
cd C:\Users\rajad\OneDrive\Desktop\project
```

### Step 3: Open the database
```bash
sqlite3 auction.db
```

### Step 4: View tables
```sql
-- List all tables
.tables

-- View users
SELECT * FROM users;

-- View auctions
SELECT * FROM auctions;

-- View bids with details
SELECT 
    b.id,
    u.username,
    a.title,
    b.bid_amount,
    b.bid_time
FROM bids b
JOIN users u ON b.user_id = u.id
JOIN auctions a ON b.auction_id = a.id;

-- Exit SQLite
.quit
```

---

## Method 4: Using VS Code Extension

### Step 1: Install SQLite Viewer Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "SQLite Viewer" or "SQLite"
4. Install the extension

### Step 2: Open the database
1. Right-click on `auction.db` in VS Code
2. Select "Open Database" or "Open with SQLite Viewer"
3. Browse tables and data

---

## Method 5: View via API Endpoints

You can also view data through API calls:

### View All Auctions:
```bash
curl http://localhost:3000/api/auctions
```

Or open in browser:
```
http://localhost:3000/api/auctions
```

### View Specific Auction:
```
http://localhost:3000/api/auctions/1
```

---

## Quick Reference: Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `created_at` - Registration timestamp

### Auctions Table
- `id` - Primary key
- `title` - Auction item title
- `description` - Item description
- `image_url` - Image URL
- `starting_bid` - Initial bid amount
- `current_bid` - Current highest bid
- `buy_now_price` - Buy now price
- `start_time` - Auction start time
- `end_time` - Auction end time
- `status` - active/ended
- `created_at` - Creation timestamp

### Bids Table
- `id` - Primary key
- `auction_id` - Foreign key to auctions
- `user_id` - Foreign key to users
- `bid_amount` - Bid amount
- `bid_time` - Bid timestamp

---

## Troubleshooting

### Database file not found?
- Make sure you've started the server at least once: `npm start`
- Check if `auction.db` exists in your project folder

### Permission errors?
- Make sure the database file is not locked (close the server if running)
- Check file permissions

### Want to reset the database?
- Stop the server
- Delete `auction.db` file
- Restart the server (it will recreate the database)

---

## Recommended Method

**For beginners:** Use Method 1 (Node.js script) - it's the easiest and shows formatted output.

**For advanced users:** Use Method 2 (DB Browser) - provides a nice GUI interface.

