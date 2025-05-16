import { Request, Response } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Job, JobStatus } from '../models/Job';
import { queueJob } from '../services/documentProcessor';
import { authMiddleware } from '../middleware/auth';
import { Server } from 'socket.io';

// Extend Express Request type to include io property
declare global {
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
}

export const jobsRouter = Router();

// Apply auth middleware once globally to all routes in this router
jobsRouter.use(authMiddleware);

// Get all jobs
jobsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch jobs' });
  }
});

// Get specific job
jobsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate('document');
    
    if (!job) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Job not found' });
      return;
    }
    
    res.json(job);
  } catch (error) {
    console.error(`Error fetching job ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch job' });
  }
});

// Create new job
jobsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    
    if (!url) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'URL is required' });
      return;
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid URL' });
      return;
    }
    
    // Queue job for processing
    if (!req.io) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Socket.io instance not available' });
      return;
    }
    
    const job = await queueJob(url, req.io);
    
    res.status(StatusCodes.CREATED).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create job' });
  }
});

// Create multiple jobs
jobsRouter.post('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'URLs array is required' });
      return;
    }
    
    // Validate URLs
    const invalidUrls = urls.filter(url => {
      try {
        new URL(url);
        return false; // URL is valid
      } catch (error) {
        return true; // URL is invalid
      }
    });
    
    if (invalidUrls.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid URLs', 
        invalidUrls 
      });
      return;
    }
    
    // Queue jobs for processing
    if (!req.io) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Socket.io instance not available' });
      return;
    }
    
    const jobs = await Promise.all(urls.map(url => queueJob(url, req.io!)));
    
    res.status(StatusCodes.CREATED).json(jobs);
  } catch (error) {
    console.error('Error creating batch jobs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create jobs' });
  }
});

// Cancel job
jobsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Job not found' });
      return;
    }
    
    // Only allow cancellation of jobs in certain statuses
    if (!['queued', 'fetching', 'processing'].includes(job.status)) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Cannot cancel job with status: ' + job.status 
      });
      return;
    }
    
    // Mark as failed with cancellation message
    job.status = JobStatus.FAILED;
    job.error = 'Job cancelled by user';
    job.statusHistory.push({
      status: JobStatus.FAILED,
      timestamp: new Date(),
      message: 'Job cancelled by user'
    });
    
    await job.save();
    
    // Emit cancellation event
    if (req.io) {
      req.io.emit(`job:${job.id}:cancelled`, { id: job.id });
    } else {
      console.warn('Socket.io instance not available for job cancellation event');
    }
    
    res.json({ message: 'Job cancelled successfully' });
  } catch (error) {
    console.error(`Error cancelling job ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to cancel job' });
  }
});