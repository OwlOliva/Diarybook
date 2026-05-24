import { useNavigate } from 'react-router-dom';
import { BookEntry } from '../../services/api';
import styles from './BookCard.module.css';

interface Props {
  book: BookEntry;
  onEdit: (book: BookEntry) => void;
  onDelete: (id: number) => void;
}

export default function BookCard({ book, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  
  const statusMap = {
    planned: '📅 Запланировано',
    reading: '📖 Читаю',
    read: '✅ Прочитано'
  };

  const handleCardClick = () => {
    navigate(`/my-book/${book.id}`);
  };

  const getStatusClass = () => {
    switch (book.status) {
      case 'planned': return styles['status-planned'];
      case 'reading': return styles['status-reading'];
      case 'read': return styles['status-read'];
      default: return '';
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {book.coverImageUrl && (
        <div className={styles.cover}>
          <img 
            src={book.coverImageUrl} 
            alt={book.title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className={styles.content}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{book.author}</p>
        {book.genre && (
          <span className={styles.genre}>{book.genre}</span>
        )}
        
        <span className={`${styles.status} ${getStatusClass()}`}>
          {statusMap[book.status]}
        </span>
        
        {book.rating && (
          <div className={styles.rating}>
            {'⭐'.repeat(book.rating)} {book.rating}/10
          </div>
        )}
        
        {book.review && (
          <p className={styles.review}>
            "{book.review.substring(0, 100)}..."
          </p>
        )}
        
        <div className={styles.actions}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }} 
            className={styles['btn-edit']}
          >
            ✏️ Редактировать
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book.id);
            }} 
            className={styles['btn-delete']}
          >
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  );
}