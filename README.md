# AI-Powered Educational Management System

A comprehensive full-stack educational management system with role-based dashboards, AI integration, and bilingual support.

## 🚀 Features

### 👑 Admin Features
- **Teacher Management**: Add, edit, delete, and view teachers
- **Student Management**: Complete student lifecycle management
- **Analytics Dashboard**: Real-time charts and statistics
- **Logs & Reports**: Activity tracking and reporting

### 👨🏫 Teacher Features
- **Virtual Classroom**: Live video sessions with WebRTC
- **Quiz Management**: Create and manage quizzes with auto-grading
- **Class Management**: Student roster and performance tracking
- **Performance Analysis**: AI-driven student analytics

### 🎓 Student Features
- **Virtual Classes**: Join live sessions with real-time translation
- **AI Tutor**: ChatGPT-powered academic assistance
- **Virtual Code Editor**: Online coding environment
- **Materials & Exams**: Access notes, quizzes, and proctored exams

### 🌟 Additional Features
- **Bilingual Support**: English ↔ Hindi with react-i18next
- **Real-time Communication**: Socket.io for live features
- **AI Integration**: OpenAI API for tutoring and proctoring
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching capability

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **AI**: OpenAI API, TensorFlow.js
- **Translation**: Google Cloud Translate API
- **Deployment**: Docker, Nginx

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PriyanshuKSharma/digital-learning.git
   cd digital-learning
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

4. **Environment Setup**
   ```bash
   cd ../server
   cp .env.example .env
   ```

5. **Start the development servers**
   
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

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Credentials

- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher1` / `teacher123`
- **Student**: `student1` / `student123`

## 🐳 Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Application: http://localhost
   - API: http://localhost:5000

---

**Built with ❤️ for education**