import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getArtsByBookId, addArt, deleteArt, getArtById } from '../models/artModel';
import { getBookById } from '../models/bookModel';
import fs from 'fs';
import path from 'path';

// Получить все арты для книги
export const getBookArts = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const bookId = parseInt(req.params.bookId  as string);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    // Проверяем, что книга принадлежит пользователю
    const book = await getBookById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const arts = await getArtsByBookId(bookId, userId);
    
    // Добавляем полный URL для изображений
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const artsWithUrls = arts.map(art => ({
      ...art,
      imageUrl: `${baseUrl}/${art.image_url}`
    }));
    
    return res.json(artsWithUrls);
  } catch (error) {
    console.error('Get book arts error:', error);
    return res.status(500).json({ error: 'Failed to fetch arts' });
  }
};

// Добавить арт к книге
export const addBookArt = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const bookId = parseInt(req.params.bookId  as string);
    const { title, description } = req.body;
    const imageFile = (req as any).file;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Проверяем, что книга принадлежит пользователю
    const book = await getBookById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const imageUrl = `${process.env.UPLOAD_DIR || 'uploads'}/arts/${imageFile.filename}`;
    const art = await addArt(bookId, userId, imageUrl, title, description);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const artWithUrl = {
      ...art,
      imageUrl: `${baseUrl}/${imageUrl}`
    };
    
    return res.status(201).json(artWithUrl);
  } catch (error) {
    console.error('Add book art error:', error);
    return res.status(500).json({ error: 'Failed to add art' });
  }
};

// Удалить арт
export const deleteBookArt = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const artId = parseInt(req.params.artId as string);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (isNaN(artId)) {
      return res.status(400).json({ error: 'Invalid art ID' });
    }
    
    // Получаем информацию об арте перед удалением
    const art = await getArtById(artId, userId);
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    
    // Удаляем файл изображения
    const filePath = path.join(process.cwd(), art.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const deleted = await deleteArt(artId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Art not found' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error('Delete book art error:', error);
    return res.status(500).json({ error: 'Failed to delete art' });
  }
};