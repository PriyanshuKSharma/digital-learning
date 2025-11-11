import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherVirtualClass = () => {
  const [classes, setClasses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    scheduledAt: '',
    duration: 60
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/virtual-class/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/virtual-class/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          subject: '',
          grade: '',
          scheduledAt: '',
          duration: 60
        });
        fetchClasses();
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const startClass = async (classId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}/start`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        navigate(`/virtual-class/${classId}`);
      }
    } catch (error) {
      console.error('Error starting class:', error);
    }
  };

  const endClass = async (classId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/virtual-class/${classId}/end`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClasses();
    } catch (error) {
      console.error('Error ending class:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Virtual Classes</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Class
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{classItem.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                {classItem.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Subject:</strong> {classItem.subject}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Grade:</strong> {classItem.grade}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Scheduled:</strong> {new Date(classItem.scheduledAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {classItem.duration} minutes
              </p>
              <p className="text-sm text-gray-600">
                <strong>Participants:</strong> {classItem.participants?.length || 0}
              </p>
            </div>

            {classItem.description && (
              <p className="text-sm text-gray-700 mb-4">{classItem.description}</p>
            )}

            <div className="flex space-x-2">
              {classItem.status === 'scheduled' && (
                <button
                  onClick={() => startClass(classItem._id)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Start Class
                </button>
              )}
              
              {classItem.status === 'live' && (
                <>
                  <button
                    onClick={() => navigate(`/virtual-class/${classItem._id}`)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Join Class
                  </button>
                  <button
                    onClick={() => endClass(classItem._id)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    End Class
                  </button>
                </>
              )}
              
              {(classItem.status === 'ended' || classItem.status === 'cancelled') && (
                <button
                  onClick={() => navigate(`/virtual-class/${classItem._id}/attendance`)}
                  className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  View Attendance
                </button>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Meeting ID: {classItem.meetingId}
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Create Virtual Class</h2>
            
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Grade</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Class
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherVirtualClass;