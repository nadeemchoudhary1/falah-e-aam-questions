import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    // For final submission calls, do not wipe session or redirect on failure
    const isSubmitUrl = error.config?.url && error.config.url.includes('/submit');

    if (error.response?.status === 401 && !isSubmitUrl) {
      // Only handle unauthorized on non-submission requests
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
