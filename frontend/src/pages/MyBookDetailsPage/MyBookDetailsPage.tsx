import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, setAuthToken, BookEntry, updateBook } from '../../services/api';
import ArtGallery from '../../components/ArtGallery/ArtGallery';
import ReadingTracker from '../../components/ReadingTracker/ReadingTracker';
import BookForm from '../../components/BookForm/BookForm';
import styles from './MyBookDetailsPage.module.css';

interface Props {
  token: string;
}

export default function MyBookDetailsPage({ token }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    setAuthToken(token);
    if (id) loadBookDetails();
  }, [id, token]);

  const loadBookDetails = async () => {
    try {
      const data = await getBook(parseInt(id!));
      setBook(data);
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookUpdate = (updatedBook: BookEntry) => {
    setBook(updatedBook);
  };

  const handleEditBook = async (formData: FormData) => {
    try {
      const updatedBook = await updateBook(book!.id, formData);
      setBook(updatedBook);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Не удалось обновить книгу');
    }
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return '#999';
    if (rating >= 8) return '#27ae60';
    if (rating >= 5) return '#f39c12';
    return '#e74c3c';
  };

  const getRatingText = (rating: number | null) => {
    if (!rating) return 'Не оценено';
    if (rating >= 8) return 'Отлично';
    if (rating >= 5) return 'Хорошо';
    return 'Средне';
  };

  if (loading) return <div className={styles.loading}>📖 Загрузка...</div>;
  if (!book) return <div className={styles.notFound}><h2>Книга не найдена</h2><button onClick={() => navigate('/')} className="btn-primary">Вернуться</button></div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <button onClick={() => navigate('/')} className={styles.backBtn}>← Назад в библиотеку</button>
        <button onClick={() => setShowEditForm(!showEditForm)} className={styles.editBtn}>
          {showEditForm ? '✖ Отмена' : '✏️ Редактировать книгу'}
        </button>
      </div>

      {showEditForm ? (
        <BookForm 
          book={book} 
          onSubmit={handleEditBook} 
          onCancel={() => setShowEditForm(false)} 
        />
      ) : (
        <>
          <div className={styles.bookCard}>
            <div className={styles.bookHeader}>
              {book.coverImageUrl && <img src={book.coverImageUrl} alt={book.title} className={styles.cover} />}
              <div className={styles.details}>
                <h1>{book.title}</h1>
                <p className={styles.author}>{book.author}</p>
                {book.genre && <span className={styles.genre}>{book.genre}</span>}
                
                <div className={styles.myReview}>
                  <h3>🔒 Моя личная заметка (видна только мне)</h3>
                  {book.rating ? (
                    <>
                      <div className={styles.rating}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: getRatingColor(book.rating) }}>{book.rating}/10</span>
                        <span className={styles.ratingBadge} style={{ background: `${getRatingColor(book.rating)}20`, color: getRatingColor(book.rating) }}>{getRatingText(book.rating)}</span>
                      </div>
                      {book.review && (
                        <div className={styles.review}>
                          <strong>Мои впечатления:</strong>
                          <p>{book.review}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.noRating}>Вы еще не оценили эту книгу</p>
                  )}
                </div>
                
                <div className={styles.status}>
                  <span className={`${styles.statusBadge} ${styles[book.status]}`}>
                    {book.status === 'read' ? '✅ Прочитано' : book.status === 'reading' ? '📖 Читаю' : '📅 Запланировано'}
                  </span>
                </div>
              </div>
            </div>

            <ReadingTracker book={book} onUpdate={handleBookUpdate} />
          </div>

          <ArtGallery bookId={book.id} token={token} />
          <div className={styles.privacyNote}>🔒 Ваши оценки, впечатления и галерея артов видны только вам.</div>
        </>
      )}
    </div>
  );
}