import { Response } from 'express';
import { AuthRequest, BookEntry } from '../types';
import {
  getBooksByUserId,
  createBook,
  updateBook,
  deleteBook,
  getBookById,
  getUserStatistics,
  updateReadPages
} from '../models/bookModel';

export const getBooks = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { status, genre } = req.query;
    const books = await getBooksByUserId(userId, status as string | undefined, genre as number | undefined);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const booksWithUrls = books.map(book => ({ ...book, coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null }));
    return res.json(booksWithUrls);
  } catch (error) {
    console.error('Get books error:', error);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
};

export const getBook = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const bookId = parseInt(req.params.id as string);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    
    const book = await getBookById(bookId, userId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bookWithUrl = { ...book, coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null };
    return res.json(bookWithUrl);
  } catch (error) {
    console.error('Get book error:', error);
    return res.status(500).json({ error: 'Failed to fetch book' });
  }
};

export const updateReadPagesController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const bookId = parseInt(req.params.id as string);
    const { readPages } = req.body;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    if (readPages === undefined || readPages < 0) return res.status(400).json({ error: 'Invalid read pages value' });
    
    const book = await getBookById(bookId, userId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    const newReadPages = Math.min(readPages, book.total_pages);
    const updatedBook = await updateReadPages(bookId, userId, newReadPages) as BookEntry ;
    
    // Добавляем coverImageUrl в ответ
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bookWithUrl = {
      ...updatedBook,
      coverImageUrl: updatedBook.cover_image ? `${baseUrl}/${updatedBook.cover_image}` : null
    };
    
    return res.json(bookWithUrl);
  } catch (error) {
    console.error('Update read pages error:', error);
    return res.status(500).json({ error: 'Failed to update read pages' });
  }
};

export const createBookController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { title, author, genreId, status, rating, review, annotation, totalPages } = req.body;
    const coverImage = (req as any).file ? `${process.env.UPLOAD_DIR || 'uploads'}/${(req as any).file.filename}` : null;
    
    if (!title || !author || !status) return res.status(400).json({ error: 'Title, author and status are required' });
    
    let readPages = 0;
    if (status === 'read' && totalPages) readPages = totalPages;
    
    const book = await createBook({
      userId, title, author,
      genreId: genreId ? parseInt(genreId) : null,
      status,
      rating: rating ? parseInt(rating) : null,
      review: review || null,
      coverImage,
      annotation: annotation || null,
      totalPages: totalPages ? parseInt(totalPages) : 0,
      readPages
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bookWithUrl = { ...book, coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null };
    return res.status(201).json(bookWithUrl);
  } catch (error) {
    console.error('Create book error:', error);
    return res.status(500).json({ error: 'Failed to create book' });
  }
};

export const updateBookController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const bookId = parseInt(req.params.id  as string);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    
    const { title, author, genreId, status, rating, review, annotation, totalPages } = req.body;
    let coverImage = undefined;
    if ((req as any).file) coverImage = `${process.env.UPLOAD_DIR || 'uploads'}/${(req as any).file.filename}`;
    
    let readPages = undefined;
    const currentBook = await getBookById(bookId, userId);
    if (status === 'read' && currentBook && currentBook.total_pages > 0) readPages = currentBook.total_pages;
    
    const updatedBook = await updateBook(bookId, userId, {
      title, author,
      genreId: genreId ? parseInt(genreId) : null,
      status,
      rating: rating ? parseInt(rating) : null,
      review: review || null,
      coverImage,
      annotation: annotation || null,
      totalPages: totalPages ? parseInt(totalPages) : undefined,
      readPages
    });
    
    if (!updatedBook) return res.status(404).json({ error: 'Book not found' });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bookWithUrl = { ...updatedBook, coverImageUrl: updatedBook.cover_image ? `${baseUrl}/${updatedBook.cover_image}` : null };
    return res.json(bookWithUrl);
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({ error: 'Failed to update book' });
  }
};

export const deleteBookController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const bookId = parseInt(req.params.id as string);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });
    
    const deleted = await deleteBook(bookId, userId);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ error: 'Failed to delete book' });
  }
};

export const getStatistics = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const statistics = await getUserStatistics(userId);
    return res.json(statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({ error: 'Failed to get statistics' });
  }
};