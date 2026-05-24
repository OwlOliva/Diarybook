import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { query } from '../config/database';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    const user = result.rows[0];
    
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};