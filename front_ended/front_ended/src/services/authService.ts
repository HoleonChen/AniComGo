import apiClient from './apiClient';
import jsCookie from 'js-cookie';
import type { User } from '../data/Model';

// Response types based on assumed API structure
interface AuthResponse {
    code: number;
    message: string;
    data: {
        token: string;
        user: User;
    };
}

// Mapper to convert API user to Model user
const mapUserFromApi = (data: any): User => {
    return {
        ...data,
        avatar_url: data.avatarUrl || data.avatar_url,
        created_at: data.createdAt || data.created_at,
        updated_at: data.updatedAt || data.updated_at,
    };
};

interface RegisterParams {
    username: string;
    password?: string;
    avatarUrl?: string;
    bio?: string;
}

interface LoginParams {
    username: string; // The backend uses username
    password?: string;
}

const authService = {
    // 登录
    login: async (credentials: LoginParams): Promise<AuthResponse> => {
        const response: any = await apiClient.post('/auth/login', credentials);
        if (response.code === 200 && response.data.token) {
            const user = mapUserFromApi(response.data.user);
            response.data.user = user; // Update response with mapped user

            jsCookie.set('token', response.data.token, { expires: 7 }); // Store token in cookie
            localStorage.setItem('user', JSON.stringify(user)); // Store user info
        }
        return response;
    },

    // 注册
    register: async (details: RegisterParams): Promise<AuthResponse> => {
        const response: any = await apiClient.post('/auth/register', details);
        if (response.code === 200 && response.data.token) {
            const user = mapUserFromApi(response.data.user);
            response.data.user = user;

            jsCookie.set('token', response.data.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response;
    },

    // 登出
    logout: () => {
        jsCookie.remove('token');
        localStorage.removeItem('user');
        // Ideally make a call to invalidate token on server too if backend supports it
        // return apiClient.post('/auth/logout');
    },

    // 获取当前用户
    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check auth status from server
    checkAuth: async (): Promise<User | null> => {
      try {
        const response: any = await apiClient.get('/users/me'); 
        if (response.code === 200) {
           const user = mapUserFromApi(response.data);
           localStorage.setItem('user', JSON.stringify(user));
           return user;
        }
        return null;
      } catch (error) {
        return null;
      }
    }
};

export default authService;

