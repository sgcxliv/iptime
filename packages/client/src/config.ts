// Configuration file for the client application

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Socket.io connection URL (if different from API URL)
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

// Application configuration
export const CONFIG = {
  appName: 'Document Processor',
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['pdf', 'html'],
};
