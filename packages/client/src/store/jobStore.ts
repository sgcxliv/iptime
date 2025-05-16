import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

export interface Job {
  _id: string;
  url: string;
  status: 'queued' | 'fetching' | 'processing' | 'chunking' | 'embedding' | 'completed' | 'failed';
  error?: string;
  progress: number;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface JobStore {
  jobs: Job[];
  isLoading: boolean;
  filters: JobFilters;
  
  setFilters: (filters: JobFilters) => void;
  fetchJobs: () => Promise<void>;
  cancelJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  
  setFilters: (filters) => set({ filters }),
  
  fetchJobs: async () => {
    try {
      const { filters } = get();
      set({ isLoading: true });
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`${API_URL}/jobs?${params.toString()}`);
      set({ jobs: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
    }
  },
  
  cancelJob: async (id) => {
    try {
      set({ isLoading: true });
      await axios.post(`${API_URL}/jobs/${id}/cancel`);
      await get().fetchJobs();
      set({ isLoading: false });
      toast.success('Job cancelled');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to cancel job');
      console.error('Error cancelling job:', error);
    }
  },
}));
