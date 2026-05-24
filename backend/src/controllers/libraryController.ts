import { Response } from 'express';
import { AuthRequest } from '../types';
import { query } from '../config/database';
import { checkBookExistsInUserLibrary, getPublicBookInfo } from '../models/bookModel';

// Публичный маршрут - доступен без авторизации
export const getAllBooks = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // userId может быть undefined для неавторизованных пользователей
    const userId = req.userId;
    
    const booksResult = await query(`
      SELECT DISTINCT ON (LOWER(be.title), LOWER(be.author)) 
        be.id,
        be.title,
        be.author,
        be.genre_id,
        g.name as genre,
        AVG(be.rating) as average_rating,
        COUNT(*) as read_count,
        MAX(be.cover_image) as cover_image,
        MAX(be.created_at) as last_read
      FROM book_entries be
      LEFT JOIN genres g ON be.genre_id = g.id
      WHERE be.title IS NOT NULL AND be.author IS NOT NULL
      GROUP BY LOWER(be.title), LOWER(be.author), be.id, be.title, be.author, be.genre_id, g.name
      ORDER BY LOWER(be.title), LOWER(be.author), read_count DESC
    `);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const booksWithUrls = await Promise.all(booksResult.rows.map(async (book: any) => {
      const publicInfo = await getPublicBookInfo(book.title, book.author);
      
      // Проверяем, есть ли книга в библиотеке пользователя (только если пользователь авторизован)
      let inMyLibrary = false;
      if (userId) {
        inMyLibrary = await checkBookExistsInUserLibrary(userId, book.title, book.author);
      }
      
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre || null,
        genre_id: book.genre_id,
        average_rating: Math.round((book.average_rating || 0) * 10) / 10,
        read_count: parseInt(book.read_count) || 0,
        cover_image: book.cover_image,
        coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null,
        last_read: book.last_read,
        inMyLibrary,
        annotation: publicInfo?.annotation || null
      };
    }));
    
    return res.json(booksWithUrls);
  } catch (error) {
    console.error('Get all books error:', error);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// Публичный маршрут - доступен без авторизации
export const getBookDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const bookId = parseInt(req.params.id as string);
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    const bookResult = await query(`
      SELECT 
        be.id,
        be.title,
        be.author,
        be.genre_id,
        g.name as genre,
        be.annotation,
        be.cover_image,
        AVG(be.rating) as average_rating,
        COUNT(*) as read_count
      FROM book_entries be
      LEFT JOIN genres g ON be.genre_id = g.id
      WHERE be.id = $1
      GROUP BY be.id, be.title, be.author, be.genre_id, g.name, be.annotation, be.cover_image
    `, [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = bookResult.rows[0];
    const comments = await getCommentsByBookId(bookId);
    
    // Проверяем, есть ли книга в библиотеке пользователя (только если пользователь авторизован)
    let inMyLibrary = false;
    if (userId) {
      inMyLibrary = await checkBookExistsInUserLibrary(userId, book.title, book.author);
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return res.json({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre || null,
      average_rating: parseFloat(book.average_rating) || 0,
      read_count: parseInt(book.read_count) || 0,
      cover_image: book.cover_image,
      coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null,
      inMyLibrary,
      comments,
      annotation: book.annotation || null
    });
  } catch (error) {
    console.error('Get book details error:', error);
    return res.status(500).json({ error: 'Failed to fetch book details' });
  }
};

// Публичный маршрут - доступен без авторизации
export const getBookComments = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const bookId = parseInt(req.params.id as string);
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    const comments = await getCommentsByBookId(bookId);
    return res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Вспомогательная функция для получения комментариев
const getCommentsByBookId = async (bookId: number): Promise<any[]> => {
  const result = await query(`
    SELECT bc.*, u.name as user_name
    FROM book_comments bc
    JOIN users u ON bc.user_id = u.id
    WHERE bc.book_id = $1
    ORDER BY bc.created_at DESC
  `, [bookId]);
  return result.rows;
};

// Защищенный маршрут - требует авторизации
export const addCommentToBook = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const bookId = parseInt(req.params.id as string);
    const { comment } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    
    const result = await query(
      `INSERT INTO book_comments (book_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [bookId, userId, comment.trim()]
    );
    
    const newComment = result.rows[0];
    const userResult = await query('SELECT name FROM users WHERE id = $1', [userId]);
    
    return res.status(201).json({
      ...newComment,
      user_name: userResult.rows[0]?.name || 'Unknown'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Защищенный маршрут - требует авторизации
export const addBookToMyLibrary = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const { title, author, genreId, coverImageUrl, rating, review, status, annotation } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }
    
    const exists = await checkBookExistsInUserLibrary(userId, title, author);
    if (exists) {
      return res.status(400).json({ error: 'You already have this book in your library' });
    }
    
    const result = await query(
      `INSERT INTO book_entries (user_id, title, author, genre_id, status, rating, review, cover_image, annotation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, title, author, genreId ? parseInt(genreId) : null, status || 'planned', rating ? parseInt(rating) : null, review || null, coverImageUrl ? coverImageUrl.replace(/^.*?\/uploads\//, 'uploads/') : null, annotation || null]
    );
    
    const book = result.rows[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return res.status(201).json({
      ...book,
      coverImageUrl: book.cover_image ? `${baseUrl}/${book.cover_image}` : null
    });
  } catch (error) {
    console.error('Add book to library error:', error);
    return res.status(500).json({ error: 'Failed to add book to your library' });
  }
};