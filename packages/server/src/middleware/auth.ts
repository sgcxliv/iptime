import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Implement your auth middleware here
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};