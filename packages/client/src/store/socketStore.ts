import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';
import { useJobStore } from './jobStore';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: () => {
    if (get().socket) return;
    
    const socket = io(API_URL, {
      withCredentials: true,
    });
    
    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Socket disconnected');
    });
    
    // Job updates
    socket.on('job:update', (job) => {
      const jobStore = useJobStore.getState();
      jobStore.fetchJobs();
    });
    
    set({ socket });
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));