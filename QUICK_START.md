# Quick Start Guide

## Option 1: Test with Mock Database (No MongoDB Setup Required)

If you want to quickly test the API structure without setting up MongoDB Atlas:

```bash
# Install dependencies
npm install

# Start mock server
npm run mock
```

Then visit:
- http://localhost:3000/api - API documentation
- http://localhost:3000/api/health - Health check
- http://localhost:3000/api/auctions - Mock auction data

## Option 2: Use Real MongoDB Atlas (Recommended for Production)

### Step 1: Get MongoDB Atlas Connection String

1. **Sign up for MongoDB Atlas** (free tier available):
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Create an account

2. **Create a Cluster**:
   - Choose "Shared Cluster" (free)
   - Select cloud provider (AWS, Google Cloud, or Azure)
   - Choose region closest to you
   - Click "Create Cluster"

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these!)
   - Set privileges: "Read and write to any database"
   - Click "Add User"

4. **Add IP Address to Whitelist**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address
   - Click "Confirm"

5. **Get Connection String**:
   - Go back to "Clusters" → click "Connect"
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string

### Step 2: Update Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` file and replace:
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/auction-house?retryWrites=true&w=majority
```

With your actual connection string (keep the database name as `auction-house`).

### Step 3: Start the Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### Step 4: Verify Setup

```bash
# Run setup verification
npm run verify

# Test API endpoints
npm run test-api

# View database (after adding some data)
npm run view-db
```

## Testing the API

Once the server is running:

1. **Health Check**: http://localhost:3000/api/health
2. **API Documentation**: http://localhost:3000/api
3. **Get Auctions**: http://localhost:3000/api/auctions
4. **Get Active Auctions**: http://localhost:3000/api/auctions/active

## Sample API Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Get Auctions
```bash
curl http://localhost:3000/api/auctions
```

## Troubleshooting

### "MONGO_URI is not defined"
- Make sure `.env` file exists in the project root
- Check that MONGO_URI is properly set in `.env`
- Restart the server after updating `.env`

### Connection Failed
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Ensure IP address is whitelisted in MongoDB Atlas
- Check username/password in connection string

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

## Next Steps

1. **Explore the code structure** in `REFACTOR_DOCUMENTATION.md`
2. **Review the models** in `models/` folder
3. **Check controllers** for business logic
4. **Test all API endpoints**
5. **Connect a frontend** to the backend API

## Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/
- Express Documentation: https://expressjs.com/