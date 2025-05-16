import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

export interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
      set({ 
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      toast.success('Login successful');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Login failed');
      console.error('Error logging in:', error);
    }
  },
  
  register: async (name, email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      set({ isLoading: false });
      toast.success('Registration successful, please log in');
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Registration failed');
      console.error('Error registering:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true });
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      toast.success('Logged out successfully');
    } catch (error) {
      set({ isLoading: false });
      console.error('Error logging out:', error);
    }
  },
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
      set({ 
        user: response.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      console.error('User not authenticated:', error);
    }
  },
}));