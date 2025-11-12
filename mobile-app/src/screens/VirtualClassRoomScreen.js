import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// WebRTC not available in Expo Go - using placeholder
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const { width, height } = Dimensions.get('window');

const VirtualClassRoomScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [classData, setClassData] = useState(null);

  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // WebRTC not available in Expo Go
      Alert.alert('Notice', 'Video calling requires a development build. This is a demo version.');

      // Initialize socket
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.emit('join-virtual-class', {
        classId,
        userId: user.id,
        userType: user.role,
      });

      // Socket event listeners
      socketRef.current.on('participant-joined', handleParticipantJoined);
      socketRef.current.on('participant-left', handleParticipantLeft);
      socketRef.current.on('chat-message', handleChatMessage);
      socketRef.current.on('video-offer', handleVideoOffer);
      socketRef.current.on('video-answer', handleVideoAnswer);
      socketRef.current.on('ice-candidate', handleIceCandidate);

      // Fetch class data
      fetchClassData();
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize video call');
      navigation.goBack();
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const fetchClassData = async () => {
    try {
      const response = await apiService.get(`/virtual-class/${classId}`);
      setClassData(response.data.data);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const handleParticipantJoined = (data) => {
    setParticipants(prev => [...prev, data]);
    if (user.role === 'teacher') {
      initiatePeerConnection(data.socketId);
    }
  };

  const handleParticipantLeft = (data) => {
    setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
    if (peerConnectionsRef.current[data.socketId]) {
      peerConnectionsRef.current[data.socketId].close();
      delete peerConnectionsRef.current[data.socketId];
    }
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[data.socketId];
      return newStreams;
    });
  };

  const handleChatMessage = (data) => {
    setMessages(prev => [...prev, data]);
  };

  const initiatePeerConnection = async (targetSocketId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionsRef.current[targetSocketId] = peerConnection;

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.onaddstream = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: event.stream,
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socketRef.current.emit('video-offer', { offer, targetSocketId });
  };

  const handleVideoOffer = async (data) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionsRef.current[data.fromSocketId] = peerConnection;

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.onaddstream = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [data.fromSocketId]: event.stream,
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId: data.fromSocketId,
        });
      }
    };

    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socketRef.current.emit('video-answer', { answer, targetSocketId: data.fromSocketId });
  };

  const handleVideoAnswer = async (data) => {
    const peerConnection = peerConnectionsRef.current[data.fromSocketId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = async (data) => {
    const peerConnection = peerConnectionsRef.current[data.fromSocketId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(data.candidate);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', {
        classId,
        message: newMessage,
        sender: user.role,
        userId: user.id,
        timestamp: new Date(),
      });
      setNewMessage('');
    }
  };

  const endClass = async () => {
    try {
      if (user.role === 'teacher') {
        await apiService.patch(`/virtual-class/${classId}/end`);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to end class');
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Video Area */}
      <View style={styles.videoContainer}>
        <View style={styles.localVideo}>
          <Text style={styles.placeholderText}>Video Preview</Text>
        </View>
        
        {/* Remote Videos */}
        <ScrollView horizontal style={styles.remoteVideos}>
          <View style={styles.remoteVideo}>
            <Text style={styles.placeholderText}>Remote Video</Text>
          </View>
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !isAudioOn && styles.controlButtonOff]}
          onPress={toggleAudio}
        >
          <Icon name={isAudioOn ? 'mic' : 'mic-off'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isVideoOn && styles.controlButtonOff]}
          onPress={toggleVideo}
        >
          <Icon name={isVideoOn ? 'videocam' : 'videocam-off'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowChat(true)}
        >
          <Icon name="chat" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endButton]}
          onPress={endClass}
        >
          <Icon name="call-end" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide">
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatMessages}>
            {messages.map((msg, index) => (
              <View key={index} style={styles.messageContainer}>
                <Text style={styles.messageSender}>{msg.sender}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInput}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Icon name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
  },
  remoteVideos: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 120,
  },
  remoteVideo: {
    width: 100,
    height: 120,
    marginHorizontal: 4,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  controlButtonOff: {
    backgroundColor: '#ef4444',
  },
  endButton: {
    backgroundColor: '#ef4444',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#137fec',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#64748b',
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VirtualClassRoomScreen;