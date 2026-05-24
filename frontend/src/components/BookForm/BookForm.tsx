import { useState, useRef, useEffect } from 'react';
import { BookEntry, getGenres, Genre } from '../../services/api';
import styles from './BookForm.module.css';

interface Props {
  book?: BookEntry;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function BookForm({ book, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [genreId, setGenreId] = useState<string>(book?.genre_id?.toString() || '');
  const [status, setStatus] = useState(book?.status || 'planned');
  const [rating, setRating] = useState(book?.rating?.toString() || '');
  const [review, setReview] = useState(book?.review || '');
  const [annotation, setAnnotation] = useState(book?.annotation || '');
  const [totalPages, setTotalPages] = useState(book?.total_pages?.toString() || '');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(book?.coverImageUrl || null);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };
    loadGenres();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  if (genreId) formData.append('genreId', genreId);
  formData.append('status', status);
  if (rating) formData.append('rating', rating);
  if (review) formData.append('review', review);
  if (annotation) formData.append('annotation', annotation);
  if (totalPages) formData.append('totalPages', totalPages); // Убедитесь, что это поле есть
  if (coverImage) formData.append('coverImage', coverImage);
  
  // Логируем для отладки
  console.log('Submitting form with totalPages:', totalPages);
  
  await onSubmit(formData);
  setLoading(false);
};

  if (loadingGenres) {
    return <div className={styles.loading}>Загрузка списка жанров...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>{book ? '📖 Редактировать книгу' : '✨ Добавить книгу'}</h2>
      
      {/* Секция обложки */}
      <div className={styles.coverSection}>
        <div className={styles.coverPreviewWrapper}>
          {coverPreview ? (
            <div className={styles.coverPreview}>
              <img src={coverPreview} alt="Обложка книги" />
              <button 
                type="button" 
                onClick={() => { setCoverImage(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} 
                className={styles.removeCover}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className={styles.coverPlaceholder}>
              <span>📷</span>
              <span>Нет обложки</span>
            </div>
          )}
        </div>
        <div className={styles.coverUpload}>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className={styles.fileInput}
            id="cover-upload"
          />
          <label htmlFor="cover-upload" className={styles.uploadLabel}>
            Выбрать изображение
          </label>
          <small className={styles.hint}>JPEG, PNG, WEBP, GIF (макс. 5MB)</small>
        </div>
      </div>
      
      {/* Основная информация */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Название книги *</label>
          <input 
            type="text" 
            placeholder="Введите название" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Автор *</label>
          <input 
            type="text" 
            placeholder="Введите автора" 
            value={author} 
            onChange={e => setAuthor(e.target.value)} 
            required 
            className={styles.input}
          />
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Жанр</label>
          <select 
            value={genreId} 
            onChange={e => setGenreId(e.target.value)}
            className={styles.select}
          >
            <option value="">Выберите жанр</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Статус чтения</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value as any)} 
            className={styles.select}
          >
            <option value="planned">📅 Запланировано</option>
            <option value="reading">📖 Читаю</option>
            <option value="read">✅ Прочитано</option>
          </select>
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            📄 Общее количество страниц
            <span className={styles.labelHint}> (необязательно)</span>
          </label>
          <input 
            type="number" 
            min="1" 
            max="10000"
            placeholder="Например: 350"
            value={totalPages} 
            onChange={e => setTotalPages(e.target.value)} 
            className={styles.input}
          />
          <small className={styles.inputHint}>
            Укажите общее количество страниц, чтобы отслеживать прогресс чтения
          </small>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            ⭐ Моя оценка
            <span className={styles.labelHint}> (1-10, видна только вам)</span>
          </label>
          <div className={styles.ratingInput}>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={rating || 5}
              onChange={e => setRating(e.target.value)} 
              className={styles.rangeInput}
            />
            <div className={styles.ratingValue}>
              <span className={styles.ratingNumber}>{rating || '?'}</span>
              <span className={styles.ratingStars}>
                {'⭐'.repeat(parseInt(rating) || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Личные впечатления */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          🔒 Мои впечатления
          <span className={styles.labelHint}> (видно только вам)</span>
        </label>
        <textarea 
          placeholder="Поделитесь своими мыслями о книге, впечатлениями, цитатами..."
          value={review} 
          onChange={e => setReview(e.target.value)} 
          rows={3}
          className={styles.textarea}
        />
      </div>
      
      {/* Аннотация */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          📝 Аннотация к книге
          <span className={styles.labelHint}> (видна всем пользователям)</span>
        </label>
        <textarea 
          placeholder="Краткое описание книги, сюжет, основные события... Это увидят другие читатели"
          value={annotation} 
          onChange={e => setAnnotation(e.target.value)} 
          rows={4}
          className={styles.textarea}
        />
        <small className={styles.inputHint}>
          Аннотация поможет другим читателям узнать о книге больше
        </small>
      </div>
      
      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Сохранение...' : '💾 Сохранить книгу'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Отмена
        </button>
      </div>
    </form>
  );
}