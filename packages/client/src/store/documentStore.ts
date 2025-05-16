import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

export interface Document {
  _id: string;
  title: string;
  url: string;
  type: 'html' | 'pdf';
  content: string;
  metadata: Record<string, any>;
  chunks: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentFilters {
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DocumentStore {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  filters: DocumentFilters;
  
  setFilters: (filters: DocumentFilters) => void;
  fetchDocuments: () => Promise<void>;
  fetchRecentDocuments: (limit?: number) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  createDocument: (url: string) => Promise<Document>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  
  setFilters: (filters) => set({ filters }),
  
  fetchDocuments: async () => {
    try {
      const { filters } = get();
      set({ isLoading: true });
      
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`${API_URL}/documents?${params.toString()}`);
      set({ documents: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch documents');
      console.error('Error fetching documents:', error);
    }
  },
  
  fetchRecentDocuments: async (limit = 5) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/documents?sortBy=createdAt&sortOrder=desc&limit=${limit}`);
      set({ documents: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch recent documents');
      console.error('Error fetching recent documents:', error);
    }
  },
  
  fetchDocumentById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`${API_URL}/documents/${id}`);
      set({ currentDocument: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch document');
      console.error('Error fetching document:', error);
    }
  },
  
  createDocument: async (url) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(`${API_URL}/documents`, { url });
      await get().fetchDocuments();
      set({ isLoading: false });
      toast.success('Document processing started');
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to create document');
      console.error('Error creating document:', error);
      throw error;
    }
  },
  
  updateDocument: async (id, data) => {
    try {
      set({ isLoading: true });
      await axios.put(`${API_URL}/documents/${id}`, data);
      
      // Update current document if it's the one being edited
      const { currentDocument } = get();
      if (currentDocument && currentDocument._id === id) {
        set({ currentDocument: { ...currentDocument, ...data } });
      }
      
      await get().fetchDocuments();
      set({ isLoading: false });
      toast.success('Document updated');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to update document');
      console.error('Error updating document:', error);
    }
  },
  
  deleteDocument: async (id) => {
    try {
      set({ isLoading: true });
      await axios.delete(`${API_URL}/documents/${id}`);
      set({ 
        documents: get().documents.filter(doc => doc._id !== id),
        currentDocument: null,
        isLoading: false 
      });
      toast.success('Document deleted');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  },
}));
