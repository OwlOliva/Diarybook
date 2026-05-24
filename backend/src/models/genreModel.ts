import { query } from '../config/database';

export interface Genre {
  id: number;
  name: string;
  created_at: Date;
}

// Получить все жанры
export const getAllGenres = async (): Promise<Genre[]> => {
  const result = await query(
    'SELECT id, name, created_at FROM genres ORDER BY name'
  );
  return result.rows;
};

// Получить жанр по ID
export const getGenreById = async (id: number): Promise<Genre | null> => {
  const result = await query(
    'SELECT id, name, created_at FROM genres WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

// Получить жанр по имени
export const getGenreByName = async (name: string): Promise<Genre | null> => {
  const result = await query(
    'SELECT id, name, created_at FROM genres WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return result.rows[0] || null;
};

// Добавить новый жанр (для админа)
export const createGenre = async (name: string): Promise<Genre> => {
  const result = await query(
    'INSERT INTO genres (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );
  return result.rows[0];
};

// Получить популярные жанры (по количеству книг)
export const getPopularGenres = async (limit: number = 10): Promise<any[]> => {
  const result = await query(`
    SELECT g.id, g.name, COUNT(be.id) as book_count
    FROM genres g
    LEFT JOIN book_entries be ON be.genre_id = g.id
    GROUP BY g.id, g.name
    ORDER BY book_count DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};