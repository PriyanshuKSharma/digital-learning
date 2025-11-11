# Virtual Class System Setup Guide

## 🎯 Overview

The virtual class system enables teachers to create and manage live video sessions with students, including real-time video/audio communication, chat, and automatic attendance tracking.

## 🚀 Features

### 👨‍🏫 Teacher Features
- **Create Virtual Classes**: Schedule classes with title, subject, grade, and duration
- **Start/End Classes**: Control class lifecycle with live status management
- **Real-time Video/Audio**: WebRTC-based video conferencing
- **Attendance Management**: Automatic and manual attendance tracking
- **Chat Moderation**: Real-time messaging during classes
- **Export Attendance**: CSV export functionality

### 🎓 Student Features
- **Join Live Classes**: Automatic discovery of available classes by grade
- **Video/Audio Participation**: Full WebRTC video calling support
- **Real-time Chat**: Participate in class discussions
- **Automatic Attendance**: Presence tracked automatically upon joining

### 🔧 Technical Features
- **WebRTC Integration**: Peer-to-peer video communication
- **Socket.io Real-time**: Live updates and messaging
- **Responsive Design**: Works on desktop and mobile
- **Role-based Access**: Secure teacher/student separation

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- Modern web browser with WebRTC support
- Camera and microphone permissions

## 🛠️ Installation

1. **Server Setup**
   ```bash
   cd server
   npm install
   ```

2. **Client Setup**
   ```bash
   cd client
   npm install
   ```

3. **Environment Variables**
   ```bash
   # server/.env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/digital-learning
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=http://localhost:3000
   ```

## 🚀 Running the System

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend Client**
   ```bash
   cd client
   npm start
   ```

4. **Test the System**
   ```bash
   node test-virtual-class.js
   ```

## 📱 Usage Guide

### For Teachers

1. **Access Virtual Classes**
   - Navigate to `/teacher/virtual-class`
   - View all created classes with status indicators

2. **Create New Class**
   - Click "Create New Class" button
   - Fill in class details:
     - Title and description
     - Subject and grade level
     - Scheduled date/time
     - Duration in minutes

3. **Start a Class**
   - Click "Start Class" on scheduled classes
   - System generates unique meeting ID and password
   - Teacher is redirected to live classroom

4. **Manage Live Class**
   - Control own video/audio
   - View all participants in grid layout
   - Monitor attendance in real-time
   - Use chat for communication
   - End class when finished

5. **Attendance Management**
   - View attendance during or after class
   - Manually mark students present/absent
   - Batch operations for multiple students
   - Export attendance as CSV

### For Students

1. **View Available Classes**
   - Navigate to `/student/class`
   - See classes filtered by your grade level
   - Live classes show with pulsing indicator

2. **Join Live Class**
   - Click "Join Live Class" on active sessions
   - Grant camera/microphone permissions
   - Automatically marked as present

3. **Participate in Class**
   - Enable/disable video and audio
   - Use chat to ask questions
   - View teacher and other students
   - Leave class anytime

## 🔧 API Endpoints

### Virtual Class Management
```
POST   /api/virtual-class/create              # Create new class (Teacher)
GET    /api/virtual-class/teacher/classes     # Get teacher's classes
PATCH  /api/virtual-class/:id/start           # Start class (Teacher)
PATCH  /api/virtual-class/:id/end             # End class (Teacher)
GET    /api/virtual-class/student/available   # Get available classes (Student)
POST   /api/virtual-class/:id/join            # Join class (Student)
POST   /api/virtual-class/:id/leave           # Leave class
GET    /api/virtual-class/:id                 # Get class details
```

### Attendance Management
```
GET    /api/virtual-class/:id/attendance           # Get attendance (Teacher)
PATCH  /api/virtual-class/:id/attendance/mark     # Mark individual attendance
PATCH  /api/virtual-class/:id/attendance/batch    # Batch mark attendance
GET    /api/virtual-class/:id/attendance/export   # Export attendance CSV
```

## 🌐 Socket.io Events

### Connection Events
```javascript
// Join virtual class
socket.emit('join-virtual-class', { classId, userId, userType });

// Leave virtual class
socket.emit('leave-virtual-class', classId);
```

### WebRTC Signaling
```javascript
// Video call signaling
socket.emit('video-offer', { offer, targetSocketId });
socket.emit('video-answer', { answer, targetSocketId });
socket.emit('ice-candidate', { candidate, targetSocketId });
```

### Chat and Controls
```javascript
// Send chat message
socket.emit('chat-message', { classId, message, sender, userId });

// Teacher controls
socket.emit('mute-participant', { participantId });
socket.emit('mark-attendance', { studentId, isPresent });
```

## 🎨 Frontend Components

### Core Components
- `VirtualClass.jsx` - Main video conferencing interface
- `TeacherVirtualClass.jsx` - Teacher class management
- `StudentVirtualClass.jsx` - Student class discovery
- `AttendanceManager.jsx` - Attendance tracking interface

### Key Features
- **Responsive Grid Layout** - Adapts to different screen sizes
- **WebRTC Video Grid** - Displays all participants
- **Real-time Chat** - Side panel messaging
- **Control Bar** - Audio/video/screen share controls
- **Attendance Modal** - Quick attendance marking

## 🔒 Security Features

- **JWT Authentication** - Secure API access
- **Role-based Authorization** - Teacher/student permissions
- **Meeting ID/Password** - Unique class identifiers
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API abuse prevention

## 📊 Database Schema

### VirtualClass Model
```javascript
{
  title: String,
  description: String,
  teacherId: ObjectId,
  subject: String,
  grade: String,
  scheduledAt: Date,
  duration: Number,
  meetingId: String,
  meetingPassword: String,
  status: ['scheduled', 'live', 'ended', 'cancelled'],
  participants: [{
    userId: ObjectId,
    joinedAt: Date,
    leftAt: Date,
    isPresent: Boolean
  }],
  chatMessages: [{
    userId: ObjectId,
    message: String,
    timestamp: Date
  }]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Camera/Microphone Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test with different browsers

2. **Video Not Connecting**
   - Check STUN/TURN server configuration
   - Verify firewall settings
   - Test WebRTC compatibility

3. **Socket Connection Failed**
   - Verify server is running
   - Check CORS configuration
   - Confirm client URL in server config

4. **Attendance Not Tracking**
   - Ensure user is properly authenticated
   - Check database connection
   - Verify API endpoints are accessible

### Debug Commands
```bash
# Check server logs
npm run dev

# Test API endpoints
node test-virtual-class.js

# Check database
mongo digital-learning
db.virtualclasses.find()
```

## 🚀 Production Deployment

### Additional Requirements
- **HTTPS Certificate** - Required for WebRTC
- **STUN/TURN Servers** - For NAT traversal
- **Load Balancer** - For Socket.io scaling
- **CDN** - For static asset delivery

### Environment Variables
```bash
NODE_ENV=production
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=turn:your-turn-server.com
TURN_USERNAME=username
TURN_CREDENTIAL=password
```

## 📈 Performance Optimization

- **Video Quality Settings** - Adaptive bitrate
- **Connection Pooling** - Database optimization
- **Caching** - Redis for session management
- **CDN Integration** - Static asset delivery
- **Monitoring** - Real-time performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement virtual class enhancements
4. Add tests for new functionality
5. Submit pull request

## 📄 License

This virtual class system is part of the Digital Learning Platform and follows the same license terms.

---

**Built with ❤️ for seamless online education**