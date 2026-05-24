import { useEffect, useState, useCallback } from 'react';
import { getBooks, createBook, updateBook, deleteBook, setAuthToken, BookEntry, getGenres, Genre } from '../../services/api';
import BookList from '../../components/BookList/BookList';
import BookForm from '../../components/BookForm/BookForm';
import styles from './DashboardPage.module.css';

interface Props {
  token: string;
}

export default function DashboardPage({ token }: Props) {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [editingBook, setEditingBook] = useState<BookEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGenreId, setFilterGenreId] = useState<string>('');
  const [genres, setGenres] = useState<Genre[]>([]);

  const loadBooks = useCallback(async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGenres = async () => {
    try {
      const data = await getGenres();
      setGenres(data);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  useEffect(() => {
    setAuthToken(token);
    loadBooks();
    loadGenres();
  }, [token, loadBooks]);

  // Получаем последнюю прочитанную книгу (статус 'read' и самая новая дата)
  const getLastReadBook = () => {
    const readBooks = books.filter(book => book.status === 'read');
    if (readBooks.length === 0) return null;
    return readBooks.reduce((latest, current) => {
      return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
    });
  };

  const lastReadBook = getLastReadBook();

  // Фильтрация книг
  const filteredBooks = books.filter(book => {
    if (filterStatus && book.status !== filterStatus) return false;
    if (filterGenreId) {
      const selectedGenre = genres.find(g => g.id.toString() === filterGenreId);
      if (selectedGenre && book.genre !== selectedGenre.name) return false;
    }
    return true;
  });

  const handleCreate = async (formData: FormData) => {
    await createBook(formData);
    setShowForm(false);
    await loadBooks();
  };

  const handleUpdate = async (formData: FormData) => {
    if (editingBook) {
      await updateBook(editingBook.id, formData);
      setEditingBook(null);
      await loadBooks();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить запись?')) {
      await deleteBook(id);
      await loadBooks();
    }
  };

  const totalBooks = filteredBooks.length;
  const readBooks = filteredBooks.filter(b => b.status === 'read').length;

  if (loading) return <div className={styles.loading}>📚 Загрузка...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Happy reading</h1>
        <p>Ваш личный дневник читателя</p>
      </div>

      <div className={styles.statsGrid}>
        <div className="stat-card"><div className="stat-number">{totalBooks}</div><div>Всего книг</div></div>
        <div className="stat-card"><div className="stat-number">{readBooks}</div><div>Прочитано</div></div>
        <div className="stat-card"><div className="stat-number">{totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0}%</div><div>Прогресс</div></div>
      </div>

      {/* Блок "Последнее прочитанное" с изображением */}
      {lastReadBook && (
        <div className={styles.lastReadSection}>
          <h3 className={styles.lastReadTitle}>📖 Последнее прочитанное</h3>
          <div className={styles.lastReadCard}>
            <div className={styles.lastReadCover}>
              {lastReadBook.coverImageUrl ? (
                <img 
                  src={lastReadBook.coverImageUrl} 
                  alt={lastReadBook.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling;
                    if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={styles.lastReadCoverPlaceholder} style={{ display: lastReadBook.coverImageUrl ? 'none' : 'flex' }}>
                📚
              </div>
            </div>
            <div className={styles.lastReadInfo}>
              <h4>{lastReadBook.title}</h4>
              <p>{lastReadBook.author}</p>
              {lastReadBook.genre && <span className={styles.lastReadGenre}>{lastReadBook.genre}</span>}
              {lastReadBook.rating && (
                <div className={styles.lastReadRating}>
                  {'⭐'.repeat(lastReadBook.rating)} {lastReadBook.rating}/10
                </div>
              )}
              {lastReadBook.review && (
                <p className={styles.lastReadReview}>"{lastReadBook.review.substring(0, 100)}..."</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="planned">📅 Запланировано</option>
            <option value="reading">📖 Читаю</option>
            <option value="read">✅ Прочитано</option>
          </select>
          <select value={filterGenreId} onChange={e => setFilterGenreId(e.target.value)}>
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Добавить книгу</button>
      </div>

      {(showForm || editingBook) && (
        <BookForm 
          book={editingBook || undefined} 
          onSubmit={editingBook ? handleUpdate : handleCreate} 
          onCancel={() => { setShowForm(false); setEditingBook(null); }} 
        />
      )}

      <div><h2>📚 Книжные полки</h2><BookList books={filteredBooks} onEdit={setEditingBook} onDelete={handleDelete} /></div>
    </div>
  );
}