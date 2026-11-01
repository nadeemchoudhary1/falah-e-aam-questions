import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://falah-e-aam-questions-ffny.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) =>
    axiosInstance.post('/login', { email, password }),
};

export const quizAPI = {
  getQuestions: (questionSetId) =>
    axiosInstance.get(`/questions/${questionSetId}`),
  submitQuiz: (submitData) =>
    axiosInstance.post('/submit', submitData),
};

export const healthAPI = {
  check: () => axiosInstance.get('/health'),
};

export default axiosInstance;
