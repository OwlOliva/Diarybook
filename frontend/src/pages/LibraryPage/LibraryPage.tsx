import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLibraryBooks, LibraryBook, getGenres, Genre } from '../../services/api';
import styles from './LibraryPage.module.css';

export default function LibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'reads' | 'title'>('rating');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
    loadGenres();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await getLibraryBooks();
      console.log('Loaded books:', data);
      setBooks(data);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await getGenres();
      setGenres(data);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesGenre = true;
    if (selectedGenres.length > 0) {
      matchesGenre = book.genre !== null && selectedGenres.includes(book.genre);
    } else if (selectedGenre) {
      matchesGenre = book.genre === selectedGenre;
    }
    return matchesSearch && matchesGenre;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'rating') return (b.average_rating || 0) - (a.average_rating || 0);
    if (sortBy === 'reads') return (b.read_count || 0) - (a.read_count || 0);
    return (a.title || '').localeCompare(b.title || '');
  });

  const handleGenreChange = (genreName: string) => {
    if (selectedGenre === genreName) setSelectedGenre('');
    else { setSelectedGenre(genreName); setSelectedGenres([]); }
  };

  const handleMultiGenreToggle = (genreName: string) => {
    setSelectedGenre('');
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedGenres([]);
    setSortBy('rating');
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/library/book/${bookId}`);
  };

  // Получаем первую книгу для блока "Последнее прочитанное"
  const lastReadBook = books.find(book => book.last_read);

  if (loading) return <div className={styles.loading}>📚 Загрузка библиотеки...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>📖 Общая библиотека</h1>
        <p>Все книги из читательских дневников пользователей</p>
      </div>

      {/* Блок "Последнее прочитанное" с картинкой */}
      {lastReadBook && (
        <div className={styles.lastReadSection}>
          <h3 className={styles.lastReadTitle}>📖 Последнее добавленное</h3>
          <div className={styles.lastReadCard} onClick={() => handleBookClick(lastReadBook.id)}>
            <div className={styles.lastReadCover}>
              {lastReadBook.coverImageUrl ? (
                <img src={lastReadBook.coverImageUrl} alt={lastReadBook.title} />
              ) : (
                <div className={styles.lastReadCoverPlaceholder}>📚</div>
              )}
            </div>
            <div className={styles.lastReadInfo}>
              <h4>{lastReadBook.title}</h4>
              <p>{lastReadBook.author}</p>
              {lastReadBook.genre && <span className={styles.lastReadGenre}>{lastReadBook.genre}</span>}
              <div className={styles.lastReadRating}>
                {'⭐'.repeat(Math.floor(lastReadBook.average_rating || 0))} 
                <span>{(lastReadBook.average_rating || 0).toFixed(1)} / 10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filtersCard}>
        <input 
          type="text" 
          placeholder="🔍 Поиск по названию или автору..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className={styles.searchInput} 
        />
        
        <div className={styles.filterBar}>
          <div className={styles.filterButtons}>
            <button onClick={() => setShowGenreFilter(!showGenreFilter)} className="btn-secondary">
              {showGenreFilter ? '📖 Скрыть жанры' : '🎭 Выбрать жанры'}
            </button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={styles.sortSelect}>
              <option value="rating">⭐ По рейтингу</option>
              <option value="reads">📊 По популярности</option>
              <option value="title">🔤 По названию</option>
            </select>
          </div>
          {(searchTerm || selectedGenre || selectedGenres.length > 0) && (
            <button onClick={clearFilters} className={styles.clearBtn}>✖ Сбросить фильтры</button>
          )}
        </div>

        {showGenreFilter && (
          <div className={styles.genrePanel}>
            <div className={styles.genrePanelHeader}>
              {selectedGenres.length > 0 ? <span>✅ Выбрано жанров: {selectedGenres.length}</span> : <span>Выберите жанры:</span>}
              <div className={styles.genreQuickActions}>
                <button onClick={() => setSelectedGenres([])} className="btn-secondary">Очистить все</button>
                <button onClick={() => setSelectedGenres(genres.map(g => g.name))} className="btn-secondary">Выбрать все</button>
              </div>
            </div>
            <div className={styles.genreGrid}>
              {genres.map(genre => {
                const isSelected = selectedGenres.includes(genre.name);
                const bookCount = books.filter(b => b.genre === genre.name).length;
                return (
                  <button key={genre.id} onClick={() => handleMultiGenreToggle(genre.name)} className={`${styles.genreBtn} ${isSelected ? styles.genreBtnSelected : ''}`}>
                    {genre.name} <span className={styles.genreCount}>({bookCount})</span> {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!showGenreFilter && (
          <div className={styles.popularGenres}>
            <div className={styles.popularGenresLabel}>Популярные жанры:</div>
            <div className={styles.genreList}>
              {genres.slice(0, 10).map(genre => {
                const isActive = selectedGenre === genre.name;
                const bookCount = books.filter(b => b.genre === genre.name).length;
                return (
                  <button key={genre.id} onClick={() => handleGenreChange(genre.name)} className={`${styles.genreChip} ${isActive ? styles.genreChipActive : ''}`}>
                    {genre.name} <span className={styles.genreCount}>({bookCount})</span>
                  </button>
                );
              })}
              {genres.length > 10 && <button onClick={() => setShowGenreFilter(true)} className="btn-secondary">+ ещё {genres.length - 10}</button>}
            </div>
          </div>
        )}
      </div>

      {(selectedGenre || selectedGenres.length > 0) && (
        <div className={styles.activeFilters}>
          <span>Активные фильтры:</span>
          {selectedGenre && (
            <span className={styles.activeFilter}>{selectedGenre}<button onClick={() => setSelectedGenre('')}>✕</button></span>
          )}
          {selectedGenres.map(genre => (
            <span key={genre} className={styles.activeFilter}>{genre}<button onClick={() => handleMultiGenreToggle(genre)}>✕</button></span>
          ))}
        </div>
      )}

      <div className={styles.resultCount}>Найдено книг: {sortedBooks.length}</div>

      {sortedBooks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>😕 Книги не найдены</p>
          <button onClick={clearFilters} className="btn-primary">Сбросить фильтры</button>
        </div>
      ) : (
        <div className={styles.booksGrid}>
          {sortedBooks.map(book => (
            <div key={book.id} className={styles.bookCard} onClick={() => handleBookClick(book.id)}>
              {book.coverImageUrl && (
                <div className={styles.bookCoverWrapper}>
                  <img src={book.coverImageUrl} alt={book.title} className={styles.bookCover} />
                </div>
              )}
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
                {book.genre && <span className={styles.bookGenre}>{book.genre}</span>}
                <div className={styles.bookRating}>
                  {'⭐'.repeat(Math.floor(book.average_rating || 0))} 
                  <span className={styles.ratingValue}>{(book.average_rating || 0).toFixed(1)} / 10</span>
                </div>
                <div className={styles.bookReads}>📖 Прочитали: {book.read_count || 0} раз</div>
              </div>
              {book.inMyLibrary && <div className={styles.inLibrary}>✓ Уже в вашей библиотеке</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}