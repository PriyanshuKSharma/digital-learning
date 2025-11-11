# Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## MongoDB Setup

### Option 1: Install MongoDB Locally
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Or start manually
   mongod --dbpath "C:\data\db"
   ```

### Option 2: Use MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `server/.env` with your Atlas connection string

## Installation Steps

1. **Clone and navigate to project**
   ```bash
   git clone <your-repo-url>
   cd digital-learning-2
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Setup environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Seed demo users**
   ```bash
   node seedUsers.js
   ```

6. **Start development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm start
   ```

## Demo Credentials
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher1` / `teacher123`
- **Student**: `student1` / `student123`

## Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017/edu_management

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify firewall settings

### Port Already in Use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Missing Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```