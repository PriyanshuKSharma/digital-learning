import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get('/auth/profile'),
};

export const adminAPI = {
  // Teachers
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  
  // Students
  getStudents: () => api.get('/admin/students'),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),
};

export const teacherAPI = {
  getClasses: () => api.get('/teacher/classes'),
  getStudents: (classId) => api.get(`/teacher/students/${classId}`),
  createQuiz: (data) => api.post('/teacher/quiz', data),
  getQuizzes: () => api.get('/teacher/quizzes'),
  updateQuiz: (id, data) => api.put(`/teacher/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/teacher/quiz/${id}`),
  updatePerformance: (studentId, data) => api.post(`/teacher/performance/${studentId}`, data),
};

export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getMaterials: () => api.get('/student/materials'),
  submitQuiz: (quizId, answers) => api.post(`/student/submit-quiz/${quizId}`, { answers }),
  getQuizzes: () => api.get('/student/quizzes'),
  chatWithAI: (message) => api.post('/student/ai-tutor', { message }),
  runCode: (code, language) => api.post('/student/code-run', { code, language }),
};

export default api;