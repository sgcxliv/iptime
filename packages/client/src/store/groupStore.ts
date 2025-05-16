import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { Document } from './documentStore';

export interface Group {
  _id: string;
  name: string;
  description: string;
  documents: string[] | Document[];
  createdAt: string;
  updatedAt: string;
}

interface GroupFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface GroupStore {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  filters: GroupFilters;
  
  setFilters: (filters: GroupFilters) => void;
  fetchGroups: () => Promise<void>;
  fetchRecentGroups: (limit?: number) => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  createGroup: (data: { name: string; description: string }) => Promise<Group>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addDocumentToGroup: (groupId: string, documentId: string) => Promise<void>;
  removeDocumentFromGroup: (groupId: string, documentId: string) => Promise<void>;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  
  setFilters: (filters) => set({ filters }),
  
  fetchGroups: async () => {
    try {
      const { filters } = get();
      set({ isLoading: true });
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`${API_URL}/groups?${params.toString()}`);
      set({ groups: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch groups');
      console.error('Error fetching groups:', error);
    }
  },
  
  fetchRecentGroups: async (limit = 5) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/groups?sortBy=createdAt&sortOrder=desc&limit=${limit}`);
      set({ groups: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch recent groups');
      console.error('Error fetching recent groups:', error);
    }
  },
  
  fetchGroupById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/groups/${id}`);
      set({ currentGroup: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch group');
      console.error('Error fetching group:', error);
    }
  },
  
  createGroup: async (data) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_URL}/groups`, data);
      await get().fetchGroups();
      set({ isLoading: false });
      toast.success('Group created');
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to create group');
      console.error('Error creating group:', error);
      throw error;
    }
  },
  
  updateGroup: async (id, data) => {
    try {
      set({ isLoading: true });
      await axios.put(`${API_URL}/groups/${id}`, data);
      
      // Update current group if it's the one being edited
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === id) {
        set({ currentGroup: { ...currentGroup, ...data } });
      }
      
      await get().fetchGroups();
      set({ isLoading: false });
      toast.success('Group updated');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to update group');
      console.error('Error updating group:', error);
    }
  },
  
  deleteGroup: async (id) => {
    try {
      set({ isLoading: true });
      await axios.delete(`${API_URL}/groups/${id}`);
      set({ 
        groups: get().groups.filter(group => group._id !== id),
        currentGroup: null,
        isLoading: false 
      });
      toast.success('Group deleted');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to delete group');
      console.error('Error deleting group:', error);
    }
  },
  
  addDocumentToGroup: async (groupId, documentId) => {
    try {
      set({ isLoading: true });
      await axios.post(`${API_URL}/groups/${groupId}/documents`, { documentId });
      
      // If we are on the group detail page, refresh the group
      if (get().currentGroup && get().currentGroup._id === groupId) {
        await get().fetchGroupById(groupId);
      }
      
      set({ isLoading: false });
      toast.success('Document added to group');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to add document to group');
      console.error('Error adding document to group:', error);
    }
  },
  
  removeDocumentFromGroup: async (groupId, documentId) => {
    try {
      set({ isLoading: true });
      await axios.delete(`${API_URL}/groups/${groupId}/documents/${documentId}`);
      
      // If we are on the group detail page, refresh the group
      if (get().currentGroup && get().currentGroup._id === groupId) {
        await get().fetchGroupById(groupId);
      }
      
      set({ isLoading: false });
      toast.success('Document removed from group');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to remove document from group');
      console.error('Error removing document from group:', error);
    }
  },
}));