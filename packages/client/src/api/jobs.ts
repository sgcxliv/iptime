import { useQuery, useMutation } from '@tanstack/react-query';
import { Job, CreateJobRequest, JobStatus } from '../types/job';
import { queryClient } from '../query';
import axios from 'axios';
import { serverOrigin } from '.';

// Fetch recent jobs
export function useRecentJobs() {
  return useQuery({
    queryKey: ['jobs.recent'],
    queryFn: async () => {
      const response = await axios.get(`${serverOrigin}/api/jobs/recent`, {
        withCredentials: true
      });
      
      if (!response.data) {
        throw new Error('Failed to fetch recent jobs');
      }
      
      return response.data;
    }
  });
}

// Get a specific job by ID
export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs.details', id],
    queryFn: async () => {
      const response = await axios.get(`${serverOrigin}/api/jobs/${id}`, {
        withCredentials: true
      });
      
      if (!response.data) {
        throw new Error(`Failed to fetch job with ID: ${id}`);
      }
      
      return response.data;
    },
    enabled: !!id
  });
}

// Create a new job
export function useCreateJob() {
  return useMutation({
    mutationFn: async (job: CreateJobRequest) => {
      const formData = new FormData();
      formData.append('title', job.title);
      formData.append('documentType', job.documentType);
      
      if (job.sourceUrl) {
        formData.append('sourceUrl', job.sourceUrl);
      }
      
      if (job.file) {
        formData.append('file', job.file);
      }
      
      const response = await axios.post(`${serverOrigin}/api/jobs`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs.recent'] });
    }
  });
}

// Cancel a job
export function useCancelJob() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`${serverOrigin}/api/jobs/${id}/cancel`, {}, {
        withCredentials: true
      });
      
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs.details', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs.recent'] });
    }
  });
}