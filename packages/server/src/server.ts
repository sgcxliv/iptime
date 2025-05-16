import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { jobsRouter } from './routes/jobs';
import { documentsRouter } from './routes/documents';
import { groupsRouter } from './routes/group';
import { authRouter } from './routes/auth';
import { config } from './config';

// Type declaration for Request to include io property
// This augments your existing declaration in global.d.ts
declare global {
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
}

// Initialize Express app
const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3001',
  'http://10.27.117.32:3001'
]
// Setup Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, 
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins, 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Make io available in request object
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/groups', groupsRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('Server is healthy');
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || 'An unexpected error occurred',
    error: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// Socket.io connection handler
io.on('connection', (socket: any) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = config.port || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});