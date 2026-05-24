import { query } from '../config/database';

export interface BookArt {
  id: number;
  book_id: number;
  user_id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

// Получить все арты для книги пользователя
export const getArtsByBookId = async (bookId: number, userId: number): Promise<BookArt[]> => {
  const result = await query(
    `SELECT * FROM book_arts 
     WHERE book_id = $1 AND user_id = $2 
     ORDER BY created_at DESC`,
    [bookId, userId]
  );
  return result.rows;
};

// Добавить арт к книге
export const addArt = async (
  bookId: number,
  userId: number,
  imageUrl: string,
  title?: string,
  description?: string
): Promise<BookArt> => {
  const result = await query(
    `INSERT INTO book_arts (book_id, user_id, image_url, title, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [bookId, userId, imageUrl, title || null, description || null]
  );
  return result.rows[0];
};

// Удалить арт
export const deleteArt = async (artId: number, userId: number): Promise<boolean> => {
  const result = await query(
    'DELETE FROM book_arts WHERE id = $1 AND user_id = $2 RETURNING id',
    [artId, userId]
  );
  return result.rowCount !== null && result.rowCount > 0;
};

// Получить арт по ID
export const getArtById = async (artId: number, userId: number): Promise<BookArt | null> => {
  const result = await query(
    'SELECT * FROM book_arts WHERE id = $1 AND user_id = $2',
    [artId, userId]
  );
  return result.rows[0] || null;
};