import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookDetails, BookDetails } from '../../services/api';
import styles from './BookDetailsPage.module.css';

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    try {
      const data = await getBookDetails(parseInt(id!));
      setBook(data);
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>📖 Загрузка...</div>;
  if (!book) return <div className={styles.notFound}><h2>Книга не найдена</h2><button onClick={() => navigate('/library')} className="btn-primary">Вернуться</button></div>;

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/library')} className={styles.backBtn}>← Назад в библиотеку</button>

      <div className={styles.bookCard}>
        <div className={styles.bookHeader}>
          {book.coverImageUrl && <img src={book.coverImageUrl} alt={book.title} className={styles.cover} />}
          <div className={styles.details}>
            <h1>{book.title}</h1>
            <p className={styles.author}>{book.author}</p>
            {book.genre && <span className={styles.genre}>{book.genre}</span>}
            
            {book.annotation && (
              <div className={styles.annotation}>
                <h4>📖 Аннотация</h4>
                <p>{book.annotation}</p>
              </div>
            )}
            
            <div className={styles.stats}>
              <div className="stat-card"><div className="stat-number">{book.average_rating.toFixed(1)}</div><div>Средняя оценка</div></div>
              <div className="stat-card"><div className="stat-number">{book.read_count}</div><div>Прочитали</div></div>
            </div>
            
            <div className={styles.infoBox}>
              <p>📝 Чтобы добавить книгу в свою библиотеку, оценить её и оставить комментарий, <a href="/login">войдите</a> или <a href="/register">зарегистрируйтесь</a>.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.commentsSection}>
        <h2>💬 Отзывы читателей</h2>
        {book.comments.length === 0 ? (
          <p className={styles.noComments}>Пока нет отзывов. Будьте первым!</p>
        ) : (
          <div className={styles.commentsList}>
            {book.comments.map(c => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentHeader}><strong>{c.user_name}</strong><span>{new Date(c.created_at).toLocaleDateString()}</span></div>
                <p>{c.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}