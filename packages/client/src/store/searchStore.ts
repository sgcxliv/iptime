import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  chunkId: string;
  content: string;
  score: number;
  highlights: {
    path: string;
    texts: { value: string; type: 'text' | 'hit' }[];
  }[];
}

interface SearchFilters {
  documentType?: string;
  groupId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SearchStore {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  filters: SearchFilters;
  
  setFilters: (filters: SearchFilters) => void;
  performSearch: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  filters: {},
  
  setFilters: (filters) => set({ filters }),
  
  performSearch: async (query) => {
    try {
      const { filters } = get();
      set({ isSearching: true, searchQuery: query });
      
      const params = new URLSearchParams();
      params.append('q', query);
      if (filters.documentType) params.append('documentType', filters.documentType);
      if (filters.groupId) params.append('groupId', filters.groupId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await axios.get(`${API_URL}/search?${params.toString()}`);
      set({ searchResults: response.data, isSearching: false });
    } catch (error) {
      set({ isSearching: false });
      toast.error('Search failed');
      console.error('Error performing search:', error);
    }
  },
}));
