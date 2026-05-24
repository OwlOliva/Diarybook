import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export interface BookEntry {
  id: number;
  user_id: number;
  title: string;
  author: string;
  genre: string | null;
  genre_id?: number | null;
  status: 'planned' | 'reading' | 'read';
  rating: number | null;
  review: string | null;
  annotation: string | null;
  total_pages: number;
  read_pages: number;
  cover_image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}