import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.stack);
  
  if (err.message.includes('duplicate key value')) {
    res.status(409).json({ error: 'Duplicate entry' });
    return;
  }
  
  if (err.message.includes('foreign key constraint')) {
    res.status(400).json({ error: 'Invalid reference' });
    return;
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};