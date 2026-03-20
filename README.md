# Auction House - Modern Auction Platform

A modern, real-time auction platform built with React, Node.js, and WebSockets. This application provides a modern e-commerce auction experience with real-time bidding, user authentication, and a responsive design.

## Features

### 🎨 Modern UI/UX
- **Modern Design System**: Built with Tailwind CSS for a clean, responsive design
- **Real-time Bidding**: Live updates with WebSocket connections
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Components**: Modern cards, modals, and interactive elements

### 🚀 Core Features
- **Real-time Bidding**: Live bid updates with WebSocket connections
- **User Authentication**: Secure JWT-based authentication
- **Auction Management**: Create, view, and manage auctions
- **Real-time Notifications**: Toast notifications for bids and updates
- **Dashboard**: User dashboard for managing auctions and bids
- **Responsive Design**: Works on all device sizes

## Tech Stack

### Frontend
- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **React Icons** for icons
- **React Toastify** for notifications
- **Context API** for state management

### Backend (Node.js/Express)
- **Express.js** web framework
- **MongoDB with Mongoose** for database
- **JWT Authentication** for secure authentication
- **WebSocket** for real-time communication
- **CORS** enabled for cross-origin requests

## Project Structure

```
auction-house/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API services
│   │   └── styles/          # CSS and Tailwind
│   └── package.json
├── backend/                  # Node.js backend
│   ├── controllers/         # Route controllers
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── server.js           # Main server file
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- MongoDB (local or Atlas)
- Modern web browser

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd auction-house
```

2. **Install dependencies:**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup:**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

4. **Start the development servers:**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Features in Detail

### 1. User Authentication
- Secure JWT-based authentication
- Protected routes
- Session management

### 2. Auction Management
- Create and manage auctions
- Real-time bidding system
- Auction countdown timers
- Bid history tracking

### 3. Real-time Features
- Live bid updates via WebSockets
- Real-time notifications
- Live auction countdowns

### 4. User Dashboard
- Personal auction management
- Bid history and tracking
- Won auctions tracking

### 5. Responsive Design
- Mobile-first responsive design
- Modern card-based layout
- Accessible and keyboard-navigable

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get specific auction
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction

### Bids
- `POST /api/bids` - Place a bid
- `GET /api/auctions/:id/bids` - Get auction bids

## Development

### Available Scripts

**Frontend:**
```bash
npm start    # Start development server
npm build    # Build for production
npm test     # Run tests
```

**Backend:**
```bash
npm run dev    # Development with nodemon
npm start      # Production start
```

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
```

## Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# The build is minified and the filenames include the hashes
```

### Backend Deployment
```bash
# Set NODE_ENV to production
NODE_ENV=production node server.js
```

## Technologies Used

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **React Toastify** - Notifications
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **WebSocket** - Real-time communication
- **Bcrypt** - Password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@auctionhouse.com or open an issue in the repository.

---

**Note:** This is a demo application. For production use, ensure proper security measures, input validation, and error handling are implemented.