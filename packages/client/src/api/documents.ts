import { useQuery, useMutation } from '@tanstack/react-query';
import { Document, CreateDocumentRequest, DocumentType } from '../types/document';
import { queryClient } from '../query';
import axios from './axiosConfig'; // Import the configured axios
import { serverOrigin } from '.';

// Fetch recent documents
export function useRecentDocuments() {
  return useQuery({
    queryKey: ['documents.recent'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${serverOrigin}/api/documents/recent`);
        // withCredentials is already set globally
        
        if (!response.data) {
          throw new Error('Failed to fetch recent documents');
        }
        
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Handle unauthorized gracefully
          console.log('Not authenticated for documents');
          return []; // Return empty array instead of throwing
        }
        throw error;
      }
    }
  });
}

// Get a document by ID
export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents.details', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${serverOrigin}/api/documents/${id}`);
        
        if (!response.data) {
          throw new Error(`Failed to fetch document with ID: ${id}`);
        }
        
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Not authenticated for document details');
          return null; // Return null for unauthorized
        }
        throw error;
      }
    },
    enabled: !!id
  });
}

// Create a new document
export function useCreateDocument() {
  return useMutation({
    mutationFn: async (document: CreateDocumentRequest) => {
      const formData = new FormData();
      formData.append('title', document.title);
      formData.append('type', document.type);
      
      if (document.url) {
        formData.append('url', document.url);
      }
      
      if (document.file) {
        formData.append('file', document.file);
      }
      
      if (document.groups && document.groups.length > 0) {
        document.groups.forEach(group => {
          formData.append('groups[]', group);
        });
      }
      
      if (document.tags && document.tags.length > 0) {
        document.tags.forEach(tag => {
          formData.append('tags[]', tag);
        });
      }
      
      const response = await axios.post(`${serverOrigin}/api/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents.recent'] });
    }
  });
}

// Update a document
export function useUpdateDocument() {
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const response = await axios.put(`${serverOrigin}/api/documents/${id}`, updates);
      
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents.details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['documents.recent'] });
    }
  });
}

// Delete a document
export function useDeleteDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${serverOrigin}/api/documents/${id}`);
      
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents.recent'] });
    }
  });
}