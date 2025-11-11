# 🎓 AI-Powered Educational Management System

A comprehensive full-stack educational platform that revolutionizes online learning with AI integration, real-time virtual classrooms, and multi-platform support.

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Features by Role](#features-by-role)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Real-time Features](#real-time-features)
- [AI Integration](#ai-integration)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)

## 🏗️ System Overview

This educational management system serves **three primary user roles**:

### 👑 **Admin** - System Management
- Complete user lifecycle management (Teachers & Students)
- Real-time analytics and reporting dashboard
- System monitoring and activity logs
- Bulk operations and data management

### 👨🏫 **Teacher** - Content & Class Management
- Virtual classroom with live video sessions
- Quiz creation and auto-grading system
- Student performance analytics
- Class roster and attendance management

### 🎓 **Student** - Learning & Assessment
- AI-powered tutoring assistance
- Virtual classroom participation
- Online code editor and compiler
- Quiz taking and progress tracking

## 🏛️ Architecture

### **Multi-Platform Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │  Static Pages   │
│   (React.js)    │    │ (React Native)  │    │   (HTML/CSS)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              API Gateway                        │
         │           (Express.js Server)                   │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │                Services Layer                   │
         ├─────────────┬─────────────┬─────────────────────┤
         │   Auth      │   Socket.io │    AI Services     │
         │  Service    │   (WebRTC)  │   (OpenAI API)     │
         └─────────────┴─────────────┴─────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Database Layer                     │
         │              (MongoDB)                          │
         └─────────────────────────────────────────────────┘
```

### **Core Components**

1. **Frontend Applications**
   - **React Web App** (`/client`) - Primary interface
   - **React Native Mobile** (`/mobile-app`) - iOS/Android support
   - **Static HTML Pages** (`/frontend`) - Lightweight alternative

2. **Backend Services**
   - **Express.js API Server** (`/server`) - Core business logic
   - **Socket.io Server** - Real-time communication
   - **AI Microservices** - OpenAI integration

3. **Database & Storage**
   - **MongoDB** - Primary data storage
   - **File Storage** - Document and media handling

## 🚀 Features by Role

### 👑 Admin Features
```javascript
// Admin API endpoints
adminAPI = {
  // User Management
  getTeachers: () => GET('/admin/teachers'),
  createTeacher: (data) => POST('/admin/teachers', data),
  updateTeacher: (id, data) => PUT('/admin/teachers/{id}', data),
  deleteTeacher: (id) => DELETE('/admin/teachers/{id}'),
  
  // Analytics
  getAnalytics: () => GET('/admin/analytics'),
  
  // Student Management
  getStudents: () => GET('/admin/students'),
  // ... similar CRUD operations
}
```

**Key Capabilities:**
- **User Management**: Complete CRUD operations for teachers and students
- **Analytics Dashboard**: Real-time charts showing system usage and performance
- **System Monitoring**: Activity logs, user status management, system health
- **Bulk Operations**: Import/export users, batch status updates

### 👨🏫 Teacher Features
```javascript
// Teacher API endpoints
teacherAPI = {
  getClasses: () => GET('/teacher/classes'),
  createQuiz: (data) => POST('/teacher/quiz', data),
  getQuizzes: () => GET('/teacher/quizzes'),
  updatePerformance: (studentId, data) => POST('/teacher/performance/{studentId}', data)
}
```

**Key Capabilities:**
- **Virtual Classroom**: Live video sessions with WebRTC technology
- **Quiz Management**: Create, edit, and auto-grade assessments
- **Performance Analytics**: AI-driven student progress analysis
- **Class Management**: Student roster, attendance tracking, grade management

### 🎓 Student Features
```javascript
// Student API endpoints
studentAPI = {
  getDashboard: () => GET('/student/dashboard'),
  chatWithAI: (data) => POST('/student/ai-tutor', data),
  submitQuiz: (quizId, answers) => POST('/student/submit-quiz/{quizId}', answers),
  runCode: (code, language) => POST('/student/code-run', {code, language})
}
```

**Key Capabilities:**
- **AI Tutor**: ChatGPT-powered academic assistance with file upload support
- **Virtual Classes**: Join live sessions with real-time translation
- **Code Editor**: Online coding environment supporting multiple languages
- **Assessment Portal**: Take quizzes, view results, track academic progress

## 🛠️ Technology Stack

### **Frontend Technologies**
- **React.js 18** - Modern component-based UI
- **Tailwind CSS** - Utility-first styling framework
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing
- **Recharts** - Data visualization and analytics
- **React i18next** - Internationalization (English/Hindi)
- **TensorFlow.js** - Client-side machine learning

### **Backend Technologies**
- **Node.js & Express.js** - Server runtime and framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Secure authentication with refresh tokens
- **Multer** - File upload handling
- **Helmet** - Security middleware

### **AI & External Services**
- **OpenAI API** - GPT-powered tutoring and content generation
- **Google Cloud Translate** - Real-time language translation
- **Google Cloud Speech** - Speech-to-text conversion
- **Cloudinary** - Media storage and optimization

### **DevOps & Infrastructure**
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **MongoDB Atlas** - Cloud database hosting
- **Multiple deployment platforms**: Vercel, Netlify, Railway, Render

## 📁 Project Structure

```
digital-learning-2/
├── client/                     # React Web Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Admin/         # Admin-specific components
│   │   │   ├── Teacher/       # Teacher-specific components
│   │   │   ├── Student/       # Student-specific components
│   │   │   └── Common/        # Shared components
│   │   ├── pages/             # Route components
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context providers
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── server/                     # Node.js Backend API
│   ├── routes/                # API route definitions
│   │   ├── auth.js           # Authentication routes
│   │   ├── admin.js          # Admin management routes
│   │   ├── teacher.js        # Teacher functionality routes
│   │   ├── student.js        # Student functionality routes
│   │   └── virtualClass.js   # Virtual classroom routes
│   ├── models/               # MongoDB data models
│   │   ├── User.js           # User authentication model
│   │   ├── Student.js        # Student profile model
│   │   ├── Teacher.js        # Teacher profile model
│   │   ├── Quiz.js           # Quiz and assessment model
│   │   ├── VirtualClass.js   # Virtual classroom model
│   │   └── AiChatHistory.js  # AI conversation history
│   ├── controllers/          # Business logic controllers
│   ├── middlewares/          # Custom middleware functions
│   ├── ai_tutor/            # AI integration services
│   │   ├── aiController.js   # AI request handling
│   │   ├── aiService.js      # OpenAI API integration
│   │   └── utils/            # AI utility functions
│   └── server.js            # Main server entry point
│
├── mobile-app/                # React Native Mobile App
│   ├── src/
│   │   ├── screens/          # Mobile screen components
│   │   ├── navigation/       # Navigation configuration
│   │   ├── components/       # Mobile UI components
│   │   └── services/         # Mobile API services
│   └── App.js
│
├── frontend/                  # Static HTML/CSS/JS Pages
│   ├── admin/                # Admin static pages
│   ├── teacher/              # Teacher static pages
│   └── students/             # Student static pages
│
├── deploy/                    # Deployment configurations
│   ├── vercel.json           # Vercel deployment config
│   ├── netlify.toml          # Netlify deployment config
│   ├── railway.json          # Railway deployment config
│   └── render.yaml           # Render deployment config
│
├── docker-compose.yml         # Multi-container orchestration
└── README.md                 # Project documentation
```

## 🔌 API Documentation

### **Authentication Endpoints**
```javascript
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Refresh access token
GET  /api/auth/profile        # Get user profile
```

### **Admin Endpoints**
```javascript
GET    /api/admin/teachers           # Get all teachers
POST   /api/admin/teachers           # Create new teacher
PUT    /api/admin/teachers/:id       # Update teacher
DELETE /api/admin/teachers/:id       # Delete teacher
PATCH  /api/admin/teachers/:id/toggle-status  # Toggle teacher status

GET    /api/admin/students           # Get all students
POST   /api/admin/students           # Create new student
PUT    /api/admin/students/:id       # Update student
DELETE /api/admin/students/:id       # Delete student

GET    /api/admin/analytics          # Get system analytics
```

### **Teacher Endpoints**
```javascript
GET    /api/teacher/classes          # Get teacher's classes
GET    /api/teacher/students/:classId # Get students in class
POST   /api/teacher/quiz             # Create new quiz
GET    /api/teacher/quizzes          # Get teacher's quizzes
PUT    /api/teacher/quiz/:id         # Update quiz
DELETE /api/teacher/quiz/:id         # Delete quiz
POST   /api/teacher/performance/:studentId # Update student performance
```

### **Student Endpoints**
```javascript
GET    /api/student/dashboard        # Get student dashboard data
GET    /api/student/materials        # Get learning materials
GET    /api/student/quizzes          # Get available quizzes
POST   /api/student/submit-quiz/:quizId # Submit quiz answers
POST   /api/student/ai-tutor         # Chat with AI tutor
GET    /api/student/ai-tutor/history # Get AI chat history
DELETE /api/student/ai-tutor/history # Clear AI chat history
POST   /api/student/transcribe-audio # Convert speech to text
POST   /api/student/code-run         # Execute code online
```

## ⚡ Real-time Features

### **Socket.io Events**
```javascript
// Virtual Classroom Events
socket.on('join-virtual-class', (data) => {
  // User joins virtual classroom
});

socket.on('chat-message', (data) => {
  // Real-time chat during class
});

socket.on('video-offer', (data) => {
  // WebRTC video call initiation
});

socket.on('screen-share-started', (data) => {
  // Teacher starts screen sharing
});

socket.on('mark-attendance', (data) => {
  // Real-time attendance tracking
});
```

### **WebRTC Integration**
- **Peer-to-peer video calls** between teachers and students
- **Screen sharing** capabilities for teachers
- **Real-time chat** during virtual sessions
- **Attendance tracking** with live updates

## 🤖 AI Integration

### **OpenAI API Features**
```javascript
// AI Tutor Implementation
const chatWithAI = async (message, fileData) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an educational AI tutor..."
      },
      {
        role: "user", 
        content: message
      }
    ]
  });
  return response.choices[0].message.content;
};
```

### **AI Capabilities**
- **Intelligent Tutoring**: Context-aware academic assistance
- **Document Analysis**: PDF/Word file processing for Q&A
- **Auto-grading**: Automated quiz evaluation
- **Speech Recognition**: Voice-to-text for accessibility
- **Real-time Translation**: Multi-language support during classes

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### **Local Development Setup**

1. **Clone Repository**
```bash
git clone <repository-url>
cd digital-learning-2
```

2. **Backend Setup**
```bash
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd client
npm install
npm start
```

4. **Environment Configuration**
```bash
# Server .env
MONGODB_URI=mongodb://localhost:27017/edu_management
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
GOOGLE_CLOUD_KEY=your_google_cloud_key

# Client .env
REACT_APP_API_URL=http://localhost:5000/api
```

### **Demo Credentials**
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher1` / `teacher123`
- **Student**: `student1` / `student123`

## 🐳 Deployment

### **Docker Deployment**
```bash
# Build and run all services
docker-compose up -d

# Access points
# Web App: http://localhost:3000
# API: http://localhost:5000
# Database: localhost:27017
```

### **Cloud Deployment Options**

#### **Vercel (Frontend)**
```json
{
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

#### **Railway (Backend)**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 🔐 Security Features

- **JWT Authentication** with access and refresh token rotation
- **Role-based Access Control** (RBAC) for different user types
- **Rate Limiting** to prevent API abuse
- **Input Validation** and sanitization
- **Helmet.js** security headers
- **CORS** configuration for cross-origin requests
- **File Upload Security** with type and size validation

## 🌐 Internationalization

- **Bilingual Support**: English ↔ Hindi
- **Dynamic Language Switching**
- **Localized Content** and notifications
- **Real-time Translation** during virtual classes

## 📊 Analytics & Monitoring

- **Real-time Dashboard** with system metrics
- **User Activity Tracking**
- **Performance Analytics** for students and teachers
- **System Health Monitoring**
- **Error Logging** and reporting

## 🎯 Use Cases

This system is ideal for:
- **Educational Institutions** seeking digital transformation
- **Online Learning Platforms** requiring AI integration
- **Corporate Training** programs
- **Remote Education** initiatives
- **Multilingual Learning** environments

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the future of education**