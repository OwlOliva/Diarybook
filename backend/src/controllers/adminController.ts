import { Response } from 'express';
import { AuthRequest } from '../types';
import { query } from '../config/database';

// ============= СТАТИСТИКА =============
export const getSystemStats = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM book_entries) as total_books,
        (SELECT COUNT(*) FROM book_entries WHERE status = 'read') as read_books,
        (SELECT COUNT(*) FROM book_comments) as total_comments,
        (SELECT COUNT(*) FROM book_arts) as total_arts,
        (SELECT COUNT(*) FROM genres) as total_genres
    `);
    
    const row = stats.rows[0];
    return res.json({
      total_users: parseInt(row?.total_users) || 0,
      admin_users: parseInt(row?.admin_users) || 0,
      total_books: parseInt(row?.total_books) || 0,
      read_books: parseInt(row?.read_books) || 0,
      total_comments: parseInt(row?.total_comments) || 0,
      total_arts: parseInt(row?.total_arts) || 0,
      total_genres: parseInt(row?.total_genres) || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ============= УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =============
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;
    
    let searchQuery = '';
    let params: any[] = [];
    
    if (search) {
      searchQuery = 'WHERE email ILIKE $3 OR name ILIKE $3';
      params = [limit, offset, `%${search}%`];
    } else {
      params = [limit, offset];
    }
    
    const usersResult = await query(`
      SELECT id, email, name, role, created_at
      FROM users
      ${searchQuery}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    const totalResult = await query(`
      SELECT COUNT(*) as count
      FROM users
      ${search ? 'WHERE email ILIKE $1 OR name ILIKE $1' : ''}
    `, search ? [`%${search}%`] : []);
    
    return res.json({
      users: usersResult.rows,
      total: parseInt(totalResult.rows[0]?.count || 0),
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id as string);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id as string);
    const { role } = req.body;
    
    if (isNaN(userId) || userId === 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    if (userId === req.userId) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }
    
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    return res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id as string);
    const { name, email } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    await query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);
    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id as string);
    
    if (isNaN(userId) || userId === 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (userId === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    await query('DELETE FROM users WHERE id = $1', [userId]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ============= УПРАВЛЕНИЕ КНИГАМИ =============
export const getAllBooksAdmin = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;
    
    let searchQuery = '';
    let params: any[] = [];
    
    if (search) {
      searchQuery = 'WHERE be.title ILIKE $3 OR be.author ILIKE $3';
      params = [limit, offset, `%${search}%`];
    } else {
      params = [limit, offset];
    }
    
    const booksResult = await query(`
      SELECT 
        be.*, 
        u.name as user_name,
        u.email as user_email,
        g.name as genre_name
      FROM book_entries be
      LEFT JOIN users u ON be.user_id = u.id
      LEFT JOIN genres g ON be.genre_id = g.id
      ${searchQuery}
      ORDER BY be.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    const totalResult = await query(`
      SELECT COUNT(*) as count
      FROM book_entries be
      ${search ? 'WHERE title ILIKE $1 OR author ILIKE $1' : ''}
    `, search ? [`%${search}%`] : []);
    
    return res.json({
      books: booksResult.rows,
      total: parseInt(totalResult.rows[0]?.count || 0),
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Get all books error:', error);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
};

export const getBookByIdAdmin = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const bookId = parseInt(req.params.id as string);
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    const result = await query(`
      SELECT be.*, u.name as user_name, g.name as genre_name
      FROM book_entries be
      LEFT JOIN users u ON be.user_id = u.id
      LEFT JOIN genres g ON be.genre_id = g.id
      WHERE be.id = $1
    `, [bookId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get book error:', error);
    return res.status(500).json({ error: 'Failed to fetch book' });
  }
};

export const updateBookAdmin = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const bookId = parseInt(req.params.id as string);
    const { title, author, genre_id, status, rating, review, annotation } = req.body;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    await query(`
      UPDATE book_entries 
      SET title = $1, author = $2, genre_id = $3, status = $4, rating = $5, review = $6, annotation = $7, updated_at = NOW()
      WHERE id = $8
    `, [title, author, genre_id, status, rating, review, annotation, bookId]);
    
    return res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({ error: 'Failed to update book' });
  }
};

export const deleteBookAdmin = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const bookId = parseInt(req.params.id as string);
    
    if (isNaN(bookId) || bookId === 0) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }
    
    const book = await query('SELECT cover_image FROM book_entries WHERE id = $1', [bookId]);
    
    if (book.rows[0]?.cover_image) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), book.rows[0].cover_image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await query('DELETE FROM book_entries WHERE id = $1', [bookId]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ error: 'Failed to delete book' });
  }
};

// ============= УПРАВЛЕНИЕ КОММЕНТАРИЯМИ =============
export const getAllComments = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const commentsResult = await query(`
      SELECT 
        bc.*,
        u.name as user_name,
        u.email as user_email,
        be.title as book_title
      FROM book_comments bc
      JOIN users u ON bc.user_id = u.id
      JOIN book_entries be ON bc.book_id = be.id
      ORDER BY bc.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const totalResult = await query('SELECT COUNT(*) as count FROM book_comments');
    
    return res.json({
      comments: commentsResult.rows,
      total: parseInt(totalResult.rows[0]?.count || 0),
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const commentId = parseInt(req.params.id as string);
    const { comment } = req.body;
    
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    
    await query('UPDATE book_comments SET comment = $1, updated_at = NOW() WHERE id = $2', [comment, commentId]);
    return res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const commentId = parseInt(req.params.id as string);
    
    if (isNaN(commentId) || commentId === 0) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
    
    await query('DELETE FROM book_comments WHERE id = $1', [commentId]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// ============= УПРАВЛЕНИЕ ЖАНРАМИ =============
export const getAllGenresAdmin = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const genresResult = await query('SELECT id, name, created_at FROM genres ORDER BY name');
    return res.json(genresResult.rows);
  } catch (error) {
    console.error('Get genres error:', error);
    return res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

export const getGenreById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const genreId = parseInt(req.params.id as string);
    if (isNaN(genreId)) {
      return res.status(400).json({ error: 'Invalid genre ID' });
    }
    
    const result = await query('SELECT * FROM genres WHERE id = $1', [genreId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get genre error:', error);
    return res.status(500).json({ error: 'Failed to fetch genre' });
  }
};

export const addGenre = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Genre name is required' });
    }
    
    const result = await query(
      'INSERT INTO genres (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name.trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Genre already exists' });
    }
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add genre error:', error);
    return res.status(500).json({ error: 'Failed to add genre' });
  }
};

export const updateGenre = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const genreId = parseInt(req.params.id as string);
    const { name } = req.body;
    
    if (isNaN(genreId)) {
      return res.status(400).json({ error: 'Invalid genre ID' });
    }
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Genre name is required' });
    }
    
    await query('UPDATE genres SET name = $1 WHERE id = $2', [name.trim(), genreId]);
    return res.json({ message: 'Genre updated successfully' });
  } catch (error) {
    console.error('Update genre error:', error);
    return res.status(500).json({ error: 'Failed to update genre' });
  }
};

export const deleteGenre = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const genreId = parseInt(req.params.id as string);
    
    if (isNaN(genreId) || genreId === 0) {
      return res.status(400).json({ error: 'Invalid genre ID' });
    }
    
    const booksWithGenre = await query('SELECT COUNT(*) as count FROM book_entries WHERE genre_id = $1', [genreId]);
    const count = parseInt(booksWithGenre.rows[0]?.count || '0');
    
    if (count > 0) {
      return res.status(400).json({ error: `Cannot delete genre with ${count} existing book(s)` });
    }
    
    await query('DELETE FROM genres WHERE id = $1', [genreId]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete genre error:', error);
    return res.status(500).json({ error: 'Failed to delete genre' });
  }
};

// ============= УПРАВЛЕНИЕ АРТАМИ =============
export const getAllArts = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const artsResult = await query(`
      SELECT 
        ba.*,
        u.name as user_name,
        be.title as book_title
      FROM book_arts ba
      JOIN users u ON ba.user_id = u.id
      JOIN book_entries be ON ba.book_id = be.id
      ORDER BY ba.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const totalResult = await query('SELECT COUNT(*) as count FROM book_arts');
    
    return res.json({
      arts: artsResult.rows,
      total: parseInt(totalResult.rows[0]?.count || 0),
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Get arts error:', error);
    return res.status(500).json({ error: 'Failed to fetch arts' });
  }
};

export const deleteArt = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const artId = parseInt(req.params.id as string);
    
    if (isNaN(artId)) {
      return res.status(400).json({ error: 'Invalid art ID' });
    }
    
    const art = await query('SELECT image_url FROM book_arts WHERE id = $1', [artId]);
    
    if (art.rows[0]?.image_url) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), art.rows[0].image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await query('DELETE FROM book_arts WHERE id = $1', [artId]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete art error:', error);
    return res.status(500).json({ error: 'Failed to delete art' });
  }
};