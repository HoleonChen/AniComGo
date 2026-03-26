import axios from 'axios';
import jsCookie from 'js-cookie';

// Default to server URL if not specified in environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frp-dry.com:29960';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add authorization header
apiClient.interceptors.request.use(
    (config) => {
        const token = jsCookie.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle global errors, e.g., 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Redirect to login or clear token
            // window.location.href = '/login'; 
            // Note: Direct redirection might interrupt UX, better handle in components or context
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

export default apiClient;

