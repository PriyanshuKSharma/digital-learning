import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const AttendanceManager = () => {
  const { classId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  useEffect(() => {
    fetchAttendance();
    fetchClassData();
  }, [classId]);

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
    } finally {
      setLoading(false);
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

  const batchMarkAttendance = async (isPresent) => {
    if (selectedStudents.size === 0) {
      alert('Please select students first');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const updates = Array.from(selectedStudents).map(studentId => ({
        studentId,
        isPresent
      }));

      const response = await fetch(`/api/virtual-class/${classId}/attendance/batch`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setSelectedStudents(new Set());
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error batch marking attendance:', error);
    }
  };

  const exportAttendance = async (format = 'csv') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/virtual-class/${classId}/attendance/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${classData?.title || 'class'}_attendance.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        console.log('Attendance data:', data);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAll = () => {
    if (selectedStudents.size === attendance.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(attendance.map(a => a.student._id)));
    }
  };

  const formatDuration = (joinedAt, leftAt) => {
    if (!joinedAt) return 'N/A';
    
    const start = new Date(joinedAt);
    const end = leftAt ? new Date(leftAt) : new Date();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return `${minutes} min`;
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-2">Attendance Management</h1>
        {classData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold">{classData.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
              <div><strong>Subject:</strong> {classData.subject}</div>
              <div><strong>Grade:</strong> {classData.grade}</div>
              <div><strong>Date:</strong> {new Date(classData.scheduledAt).toLocaleDateString()}</div>
              <div><strong>Duration:</strong> {classData.duration} min</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={selectAll}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {selectedStudents.size === attendance.length ? 'Deselect All' : 'Select All'}
        </button>
        
        <button
          onClick={() => batchMarkAttendance(true)}
          disabled={selectedStudents.size === 0}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Mark Selected Present
        </button>
        
        <button
          onClick={() => batchMarkAttendance(false)}
          disabled={selectedStudents.size === 0}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Mark Selected Absent
        </button>
        
        <button
          onClick={() => exportAttendance('csv')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {attendance.filter(a => a.isPresent).length}
          </div>
          <div className="text-sm text-green-700">Present</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {attendance.filter(a => !a.isPresent).length}
          </div>
          <div className="text-sm text-red-700">Absent</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {attendance.length}
          </div>
          <div className="text-sm text-blue-700">Total Students</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedStudents.size === attendance.length && attendance.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Left At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record.student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(record.student._id)}
                    onChange={() => toggleStudentSelection(record.student._id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {record.student.fullName?.charAt(0) || 'S'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.student.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.isPresent 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.isPresent ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.joinedAt ? new Date(record.joinedAt).toLocaleTimeString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.leftAt ? new Date(record.leftAt).toLocaleTimeString() : 'Still in class'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(record.joinedAt, record.leftAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => markAttendance(record.student._id, true)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(record.student._id, false)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendance.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
          <p className="text-gray-500">Attendance will appear here once students join the class</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;