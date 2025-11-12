# Digital Learning Mobile App

A React Native mobile application for the Digital Learning Platform with virtual classroom capabilities.

## 🚀 Features

### 📱 **Mobile-First Design**
- Native iOS and Android support
- Responsive UI optimized for mobile devices
- Touch-friendly interface with Material Design

### 🎓 **Virtual Classroom**
- Real-time video calling with WebRTC
- Live chat during classes
- Join/leave classes seamlessly
- Mobile-optimized video controls

### 👥 **Role-Based Access**
- **Teachers**: Create, start, and manage classes
- **Students**: Join available classes by grade
- **Attendance**: Automatic tracking and manual management

### 📊 **Dashboard & Analytics**
- Personalized dashboard with stats
- Quick access to classes and features
- Recent activity overview

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Video Calling**: React Native WebRTC
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage
- **Icons**: React Native Vector Icons

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup

1. **Install dependencies**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📱 App Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── VirtualClassListScreen.js
│   │   ├── VirtualClassRoomScreen.js
│   │   ├── AttendanceScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/         # Navigation configuration
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── context/           # React Context providers
│   │   └── AuthContext.js
│   ├── services/          # API and external services
│   │   └── apiService.js
│   └── utils/             # Utility functions
├── App.js                 # Main app component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### API Configuration
Update the base URL in `src/services/apiService.js`:
```javascript
const BASE_URL = 'https://your-server-url.com/api';
```

### WebRTC Configuration
The app uses STUN servers for WebRTC. For production, configure TURN servers in `VirtualClassRoomScreen.js`:
```javascript
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com',
      username: 'username',
      credential: 'password'
    }
  ],
});
```

## 📱 Screens Overview

### 🔐 **Authentication**
- **LoginScreen**: Username/password login
- **SignUpScreen**: Registration (admin-only message)

### 🏠 **Dashboard**
- **DashboardScreen**: Stats, quick actions, recent classes
- Role-specific content for teachers and students

### 🎥 **Virtual Classes**
- **VirtualClassListScreen**: Browse and manage classes
- **VirtualClassRoomScreen**: Live video calling interface
- **AttendanceScreen**: Attendance management (teachers)

### 👤 **Profile**
- **ProfileScreen**: User info, settings, logout

## 🎨 Design System

### Colors
- **Primary**: `#137fec` (Blue)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Background**: `#f6f7f8` (Light Gray)

### Typography
- **Headers**: Bold, 18-32px
- **Body**: Regular, 14-16px
- **Captions**: 12-14px, muted colors

## 📱 Platform-Specific Features

### iOS
- Native navigation animations
- iOS-style alerts and modals
- Optimized for iPhone and iPad

### Android
- Material Design components
- Android-specific permissions
- Adaptive icons and splash screens

## 🔒 Permissions

### Required Permissions
- **Camera**: For video calling
- **Microphone**: For audio in calls
- **Internet**: For API calls and WebRTC
- **Network State**: For connection monitoring

## 🚀 Building for Production

### iOS Build
```bash
expo build:ios
```

### Android Build
```bash
expo build:android
```

### App Store Deployment
1. Configure app signing in `app.json`
2. Build production version
3. Upload to App Store Connect / Google Play Console

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Device Testing
- Use Expo Go app for quick testing
- Test on multiple device sizes
- Verify camera/microphone permissions

## 🔧 Troubleshooting

### Common Issues

1. **WebRTC Not Working**
   - Ensure HTTPS in production
   - Check camera/microphone permissions
   - Verify STUN/TURN server configuration

2. **Socket Connection Failed**
   - Check server URL in apiService.js
   - Verify server is running and accessible
   - Check network connectivity

3. **Build Errors**
   - Clear Expo cache: `expo r -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Expo SDK compatibility

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement mobile-specific features
4. Test on iOS and Android
5. Submit pull request

---

**Built with ❤️ for mobile education**