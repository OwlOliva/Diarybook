import { Request, Response } from 'express';
import { getAllGenres, getPopularGenres, getGenreById, createGenre } from '../models/genreModel';

// Получить все жанры
export const getGenres = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const genres = await getAllGenres();
    return res.json(genres);
  } catch (error) {
    console.error('Get genres error:', error);
    return res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

// Получить популярные жанры
export const getPopularGenresList = async (req: Request, res: Response): Promise<Response> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const genres = await getPopularGenres(limit);
    return res.json(genres);
  } catch (error) {
    console.error('Get popular genres error:', error);
    return res.status(500).json({ error: 'Failed to fetch popular genres' });
  }
};

// Получить жанр по ID
export const getGenre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid genre ID' });
    }
    
    const genre = await getGenreById(id);
    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    return res.json(genre);
  } catch (error) {
    console.error('Get genre error:', error);
    return res.status(500).json({ error: 'Failed to fetch genre' });
  }
};

// Создать новый жанр (опционально, для админа)
export const createNewGenre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Genre name is required' });
    }
    
    const genre = await createGenre(name.trim());
    return res.status(201).json(genre);
  } catch (error) {
    console.error('Create genre error:', error);
    return res.status(500).json({ error: 'Failed to create genre' });
  }
};