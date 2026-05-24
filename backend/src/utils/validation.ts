import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Валидация регистрации
export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2, max: 100 }),
];

// Валидация логина
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Валидация создания книги
export const validateBookCreate = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('author').notEmpty().withMessage('Author is required').trim(),
  body('genre').optional().trim(),
  body('status').isIn(['planned', 'reading', 'read']).withMessage('Invalid status'),
  body('rating').optional().isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('review').optional().trim(),
];

// Валидация обновления книги
export const validateBookUpdate = [
  body('title').optional().trim(),
  body('author').optional().trim(),
  body('genre').optional().trim(),
  body('status').optional().isIn(['planned', 'reading', 'read']),
  body('rating').optional().isInt({ min: 1, max: 10 }),
  body('review').optional().trim(),
];

// Middleware для проверки результатов валидации
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
    return;
  }
  next();
};