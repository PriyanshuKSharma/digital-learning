import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentVirtualClass = () => {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/virtual-class/student/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async (classId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        navigate(`/virtual-class/${classId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to join class');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      alert('Failed to join class');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800 animate-pulse';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeUntilClass = (scheduledAt) => {
    const now = new Date();
    const classTime = new Date(scheduledAt);
    const diffMs = classTime - now;
    
    if (diffMs < 0) return 'Started';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day(s)`;
    if (diffHours > 0) return `${diffHours} hour(s)`;
    if (diffMins > 0) return `${diffMins} minute(s)`;
    return 'Starting soon';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Virtual Classes</h1>
        <p className="text-gray-600">Join live classes or view upcoming sessions</p>
      </div>

      {availableClasses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes available</h3>
          <p className="text-gray-500">Check back later for upcoming virtual classes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableClasses.map((classItem) => (
            <div key={classItem._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{classItem.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                  {classItem.status === 'live' ? '🔴 LIVE' : classItem.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">Subject:</span>
                  <span>{classItem.subject}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">Grade:</span>
                  <span>{classItem.grade}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">Teacher:</span>
                  <span>{classItem.teacherId?.userId?.fullName || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">Time:</span>
                  <span>{new Date(classItem.scheduledAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">Duration:</span>
                  <span>{classItem.duration} minutes</span>
                </div>
                
                {classItem.status === 'scheduled' && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-20 text-gray-600">Starts in:</span>
                    <span className="text-blue-600 font-medium">
                      {getTimeUntilClass(classItem.scheduledAt)}
                    </span>
                  </div>
                )}
              </div>

              {classItem.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{classItem.description}</p>
              )}

              <div className="flex flex-col space-y-2">
                {classItem.status === 'live' && (
                  <button
                    onClick={() => joinClass(classItem._id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
                  >
                    🎥 Join Live Class
                  </button>
                )}
                
                {classItem.status === 'scheduled' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                  >
                    ⏰ Scheduled
                  </button>
                )}
                
                <div className="text-xs text-gray-500 text-center">
                  Meeting ID: {classItem.meetingId}
                </div>
              </div>

              {/* Participants count */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>👥 {classItem.participants?.length || 0} participants</span>
                  {classItem.status === 'live' && (
                    <span className="text-green-600 font-medium">● Active now</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchAvailableClasses}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh Classes
        </button>
      </div>
    </div>
  );
};

export default StudentVirtualClass;