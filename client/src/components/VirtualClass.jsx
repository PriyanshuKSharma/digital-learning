import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const VirtualClass = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const userType = user?.role;
  const userId = user?.id;
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [classData, setClassData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [timer, setTimer] = useState('00:00:00');
  const [startTime] = useState(Date.now());
  
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-virtual-class', { classId, userId, userType });

    newSocket.on('participant-joined', (data) => {
      setParticipants(prev => [...prev, data]);
      if (userType === 'teacher') {
        initiatePeerConnection(data.socketId);
      }
    });

    newSocket.on('participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
      if (peerConnectionsRef.current[data.socketId]) {
        peerConnectionsRef.current[data.socketId].close();
        delete peerConnectionsRef.current[data.socketId];
      }
    });

    newSocket.on('chat-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('video-offer', handleVideoOffer);
    newSocket.on('video-answer', handleVideoAnswer);
    newSocket.on('ice-candidate', handleIceCandidate);

    initializeMedia();
    fetchClassData();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      newSocket.disconnect();
    };
  }, [classId, userId, userType]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClassData(data.data);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const initiatePeerConnection = async (targetSocketId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnectionsRef.current[targetSocketId] = peerConnection;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteVideo = remoteVideosRef.current[targetSocketId];
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId
        });
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('video-offer', { offer, targetSocketId });
  };

  const handleVideoOffer = async (data) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnectionsRef.current[data.fromSocketId] = peerConnection;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteVideo = remoteVideosRef.current[data.fromSocketId];
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId: data.fromSocketId
        });
      }
    };

    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('video-answer', { answer, targetSocketId: data.fromSocketId });
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

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        classId,
        message: newMessage,
        sender: userType,
        userId,
        timestamp: new Date()
      });
      setNewMessage('');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const markAttendance = async (studentId, isPresent) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}/attendance/mark`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, isPresent })
      });
      
      if (response.ok) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAttendance(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const endClass = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/virtual-class/${classId}/end`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = '/teacher/virtual-class';
    } catch (error) {
      console.error('Error ending class:', error);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* Top Nav Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-3 shrink-0">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight">{classData?.title || 'Virtual Classroom'}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-1.5 text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-base">radio_button_checked</span>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
            <span className="material-symbols-outlined text-base text-slate-500 dark:text-slate-400">timer</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{timer}</span>
          </div>
          {userType === 'teacher' && (
            <button
              onClick={() => setShowAttendance(!showAttendance)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined">group</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col p-4 gap-4">
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-900 relative">
            {/* Main Video */}
            <div className="relative flex items-center justify-center bg-black bg-cover bg-center h-full w-full">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-lg">
                You ({userType})
              </div>
              {!isVideoOn && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">person</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participant Filmstrip */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {participants.map((participant) => (
              <div key={participant.socketId} className="relative flex flex-col gap-3 group">
                <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg bg-slate-800">
                  <video
                    ref={(el) => {
                      if (el) remoteVideosRef.current[participant.socketId] = el;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-md">
                  {participant.userType} {participant.userId}
                </div>
                <div className="absolute top-2 right-2 size-6 flex items-center justify-center bg-black/50 text-white rounded-full">
                  <span className="material-symbols-outlined !text-base">mic_off</span>
                </div>
              </div>
            ))}
            {participants.length > 6 && (
              <div className="relative flex flex-col gap-3 group">
                <div className="w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 aspect-video bg-cover rounded-lg">
                  +{participants.length - 6} more
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Side Panel */}
        <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="shrink-0 border-b border-slate-200 dark:border-slate-800">
            <div className="flex p-2">
              <button
                onClick={() => setShowChat(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg ${!showChat ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Participants ({participants.length + 1})
              </button>
              <button
                onClick={() => setShowChat(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg ${showChat ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Chat
              </button>
            </div>
          </div>

          {showChat ? (
            /* Chat Panel */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-sm bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-background-light dark:bg-background-dark border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Participants Panel */
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <input
                  className="w-full bg-background-light dark:bg-background-dark border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="Search participants..."
                  type="search"
                />
              </div>
              {userType === 'teacher' && (
                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
                  <span className="material-symbols-outlined !text-xl">voice_over_off</span>
                  Mute All
                </button>
              )}
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.socketId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {participant.userId?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="font-medium text-sm">{participant.userType} {participant.userId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined !text-xl">mic_off</span>
                      </button>
                      <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined !text-xl">videocam</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Control Bar */}
      <footer className="flex items-center justify-center p-4 border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark shrink-0">
        <div className="flex justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioOn ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-red-600 text-white'} hover:bg-slate-300 dark:hover:bg-slate-700`}
          >
            <span className="material-symbols-outlined">{isAudioOn ? 'mic' : 'mic_off'}</span>
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOn ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-red-600 text-white'} hover:bg-slate-300 dark:hover:bg-slate-700`}
          >
            <span className="material-symbols-outlined">{isVideoOn ? 'videocam' : 'videocam_off'}</span>
          </button>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <button className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700">
            <span className="material-symbols-outlined">present_to_all</span>
          </button>
          <button className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700">
            <span className="material-symbols-outlined">draw</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full ${showChat ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'} hover:bg-primary/90`}
          >
            <span className="material-symbols-outlined">chat</span>
          </button>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          {userType === 'teacher' && (
            <button
              onClick={endClass}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <span className="material-symbols-outlined">call_end</span>
            </button>
          )}
        </div>
      </footer>

      {/* Attendance Modal */}
      {showAttendance && userType === 'teacher' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Attendance</h3>
              <button
                onClick={() => setShowAttendance(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.socketId} className="flex justify-between items-center">
                  <span className="text-sm">{participant.userType} {participant.userId}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => markAttendance(participant.userId, true)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(participant.userId, false)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualClass;