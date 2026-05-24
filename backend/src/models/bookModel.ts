import { query } from '../config/database';
import { BookEntry } from '../types';

export interface CreateBookData {
  userId: number;
  title: string;
  author: string;
  genreId?: number | null;
  status: string;
  rating?: number | null;
  review?: string | null;
  coverImage?: string | null;
  annotation?: string | null;
  totalPages?: number | null;
  readPages?: number | null;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  genreId?: number | null;
  status?: string;
  rating?: number | null;
  review?: string | null;
  coverImage?: string | null;
  annotation?: string | null;
  totalPages?: number | null;
  readPages?: number | null;
}

export interface BookComment {
  id: number;
  book_id: number;
  user_id: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
  user_name?: string;
}

// Существующие функции...
export const createBook = async (data: CreateBookData): Promise<BookEntry> => {
  console.log('📝 createBook called with:', {
    title: data.title,
    author: data.author,
    annotation: data.annotation,
    hasAnnotation: !!data.annotation
  });
  
  const result = await query(
    `INSERT INTO book_entries (user_id, title, author, genre_id, status, rating, review, cover_image, annotation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.userId, 
      data.title, 
      data.author, 
      data.genreId, 
      data.status, 
      data.rating, 
      data.review, 
      data.coverImage,
      data.annotation || null
    ]
  );
  
  console.log('✅ Created book, annotation in DB:', result.rows[0]?.annotation);
  return result.rows[0];
};

export const getBooksByUserId = async (userId: number, status?: string, genreId?: number): Promise<BookEntry[]> => {
  let sql = `
    SELECT be.*, g.name as genre_name 
    FROM book_entries be
    LEFT JOIN genres g ON be.genre_id = g.id
    WHERE be.user_id = $1
  `;
  const params: any[] = [userId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND be.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (genreId) {
    sql += ` AND be.genre_id = $${paramIndex}`;
    params.push(genreId);
    paramIndex++;
  }

  sql += ' ORDER BY be.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
};

export const getBookById = async (id: number, userId: number): Promise<BookEntry | null> => {
  const result = await query(
    `SELECT be.*, g.name as genre_name 
     FROM book_entries be
     LEFT JOIN genres g ON be.genre_id = g.id
     WHERE be.id = $1 AND be.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
};

export const updateBook = async (id: number, userId: number, data: UpdateBookData): Promise<BookEntry | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.author !== undefined) {
    updates.push(`author = $${paramIndex++}`);
    values.push(data.author);
  }
  if (data.genreId !== undefined) {
    updates.push(`genre_id = $${paramIndex++}`);
    values.push(data.genreId);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.rating !== undefined) {
    updates.push(`rating = $${paramIndex++}`);
    values.push(data.rating);
  }
  if (data.review !== undefined) {
    updates.push(`review = $${paramIndex++}`);
    values.push(data.review);
  }
  if (data.coverImage !== undefined) {
    updates.push(`cover_image = $${paramIndex++}`);
    values.push(data.coverImage);
  }
  if (data.annotation !== undefined) {
    updates.push(`annotation = $${paramIndex++}`);
    values.push(data.annotation);
  }
  if (data.totalPages !== undefined) {
    updates.push(`total_pages = $${paramIndex++}`);
    values.push(data.totalPages);
    console.log('Setting total_pages to:', data.totalPages); // Логируем
  }
  if (data.readPages !== undefined) {
    updates.push(`read_pages = $${paramIndex++}`);
    values.push(data.readPages);
  }

  if (updates.length === 0) {
    return getBookById(id, userId);
  }

  values.push(id, userId);
  
  const sql = `UPDATE book_entries SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
  console.log('SQL:', sql); // Логируем SQL запрос
  console.log('Values:', values); // Логируем значения
  
  const result = await query(sql, values);
  return result.rows[0] || null;
};


export const deleteBook = async (id: number, userId: number): Promise<boolean> => {
  const book = await getBookById(id, userId);
  
  if (book && book.cover_image) {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), book.cover_image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  const result = await query(
    'DELETE FROM book_entries WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount !== null && result.rowCount > 0;
};

export const getUserStatistics = async (userId: number) => {
  const booksResult = await query(
    `SELECT * FROM book_entries 
     WHERE user_id = $1 AND status = 'read'`,
    [userId]
  );
  
  const books = booksResult.rows;
  const totalRead = books.length;
  
  let averageRating = 0;
  if (totalRead > 0) {
    const ratingSum = books.reduce((sum: number, book: any) => sum + (book.rating || 0), 0);
    averageRating = Math.round((ratingSum / totalRead) * 10) / 10;
  }

  const monthlyResult = await query(
    `SELECT 
       TO_CHAR(created_at, 'YYYY-MM') as month,
       COUNT(*) as count
     FROM book_entries
     WHERE user_id = $1 AND status = 'read'
     GROUP BY TO_CHAR(created_at, 'YYYY-MM')
     ORDER BY month DESC
     LIMIT 12`,
    [userId]
  );

  const genreResult = await query(
    `SELECT 
       g.name as genre,
       COUNT(*) as count
     FROM book_entries be
     LEFT JOIN genres g ON be.genre_id = g.id
     WHERE be.user_id = $1 AND be.status = 'read' AND be.genre_id IS NOT NULL
     GROUP BY g.name
     ORDER BY count DESC`,
    [userId]
  );

  return {
    totalRead,
    averageRating,
    countsByMonth: monthlyResult.rows.map((row: any) => ({ month: row.month, count: parseInt(row.count) })),
    genreDistribution: genreResult.rows.map((row: any) => ({ genre: row.genre, count: parseInt(row.count) }))
  };
};

// ============= НОВЫЕ ФУНКЦИИ ДЛЯ LIBRARY CONTROLLER =============

// Получить все уникальные книги из всех дневников
export const getAllUniqueBooks = async (): Promise<any[]> => {
  const result = await query(`
    SELECT DISTINCT ON (LOWER(title), LOWER(author)) 
      id,
      title,
      author,
      MAX(genre_id) as genre_id,
      AVG(rating) as average_rating,
      COUNT(*) as read_count,
      MAX(cover_image) as cover_image,
      MAX(created_at) as last_read
    FROM book_entries
    WHERE title IS NOT NULL AND author IS NOT NULL
    GROUP BY LOWER(title), LOWER(author), id, title, author
    ORDER BY LOWER(title), LOWER(author), read_count DESC
  `);
  
  return result.rows;
};

// Получить комментарии к книге
export const getCommentsByBookId = async (bookId: number): Promise<BookComment[]> => {
  const result = await query(`
    SELECT bc.*, u.name as user_name
    FROM book_comments bc
    JOIN users u ON bc.user_id = u.id
    WHERE bc.book_id = $1
    ORDER BY bc.created_at DESC
  `, [bookId]);
  
  return result.rows;
};

// Добавить комментарий к книге
export const addComment = async (bookId: number, userId: number, comment: string): Promise<BookComment> => {
  const result = await query(
    `INSERT INTO book_comments (book_id, user_id, comment)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [bookId, userId, comment]
  );
  return result.rows[0];
};

// Получить среднюю оценку книги
export const getBookAverageRating = async (bookId: number): Promise<number> => {
  const result = await query(`
    SELECT AVG(rating) as average_rating
    FROM book_entries
    WHERE id = $1 AND rating IS NOT NULL
  `, [bookId]);
  
  return parseFloat(result.rows[0]?.average_rating) || 0;
};

// Проверить, есть ли книга в библиотеке пользователя
export const checkBookExistsInUserLibrary = async (userId: number, title: string, author: string): Promise<boolean> => {
  const result = await query(
    `SELECT id FROM book_entries 
     WHERE user_id = $1 AND LOWER(title) = LOWER($2) AND LOWER(author) = LOWER($3)`,
    [userId, title, author]
  );
  return result.rows.length > 0;
};

// Получить публичную аннотацию книги
// Получить публичную аннотацию книги (исправленная версия)
export const getPublicBookInfo = async (title: string, author: string): Promise<any> => {
  const result = await query(`
    SELECT 
      annotation,
      cover_image
    FROM book_entries
    WHERE LOWER(title) = LOWER($1) 
      AND LOWER(author) = LOWER($2)
      AND annotation IS NOT NULL 
      AND annotation != ''
    ORDER BY created_at DESC
    LIMIT 1
  `, [title, author]);
  
  console.log('getPublicBookInfo result:', { 
    title, 
    author, 
    found: result.rows.length > 0,
    annotation: result.rows[0]?.annotation?.substring(0, 50) 
  });
  
  return result.rows[0] || null;
};
// export const updateReadPages = async (id: number, userId: number, readPages: number): Promise<BookEntry | null> => {
//   const result = await query(
//     `UPDATE book_entries 
//      SET read_pages = $1, updated_at = NOW() 
//      WHERE id = $2 AND user_id = $3 
//      RETURNING *`,
//     [readPages, id, userId]
//   );
  
  
//   // Если прочитано все страницы, автоматически меняем статус на "read"
//   if (result.rows[0] && result.rows[0].total_pages > 0 && result.rows[0].read_pages >= result.rows[0].total_pages) {
//     const updatedResult = await query(
//       `UPDATE book_entries 
//        SET status = 'read', updated_at = NOW() 
//        WHERE id = $1 AND user_id = $2 
//        RETURNING *`,
//       [id, userId]
//     );
//     return updatedResult.rows[0];
//   }
  
//   return result.rows[0];
// };

export const updateReadPages = async (id: number, userId: number, readPages: number): Promise<BookEntry | null> => {
  // Получаем текущую книгу
  const currentBook = await getBookById(id, userId);
  if (!currentBook) return null;
  
  // Обновляем количество прочитанных страниц
  const result = await query(
    `UPDATE book_entries 
     SET read_pages = $1, updated_at = NOW() 
     WHERE id = $2 AND user_id = $3 
     RETURNING *`,
    [readPages, id, userId]
  );
  
  const updatedBook = result.rows[0];
  
  // Проверяем, прочитана ли книга полностью
  if (updatedBook && updatedBook.total_pages > 0 && updatedBook.read_pages >= updatedBook.total_pages) {
    // Если статус "reading", меняем на "read"
    if (updatedBook.status === 'reading') {
      console.log(`Book ${id} is fully read! Changing status from 'reading' to 'read'`);
      const finalResult = await query(
        `UPDATE book_entries 
         SET status = 'read', updated_at = NOW() 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
      );
      return finalResult.rows[0];
    }
  }
  
  return updatedBook;
};