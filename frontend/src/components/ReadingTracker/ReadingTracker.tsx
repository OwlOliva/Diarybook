import { useState, useEffect } from 'react';
import { updateReadPages, BookEntry } from '../../services/api';
import styles from './ReadingTracker.module.css';

interface Props {
  book: BookEntry;
  onUpdate: (updatedBook: BookEntry) => void;
}

export default function ReadingTracker({ book, onUpdate }: Props) {
  const [readPages, setReadPages] = useState(book.read_pages);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(book.status);

  const totalPages = book.total_pages || 0;
  const progress = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

  useEffect(() => {
    setReadPages(book.read_pages);
    setLocalStatus(book.status);
  }, [book.read_pages, book.status]);

  const handleUpdatePages = async () => {
    if (readPages < 0) return;
    if (readPages > totalPages && totalPages > 0) return;
    
    setIsUpdating(true);
    try {
      const updatedBook = await updateReadPages(book.id, readPages);
      
      if (updatedBook) {
        onUpdate(updatedBook);
        
        if (updatedBook.status === 'read') {
          setLocalStatus('read');
        }
      }
    } catch (error) {
      console.error('Error updating read pages:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const incrementPages = () => {
    let newValue = readPages + 10;
    if (totalPages > 0 && newValue >= totalPages) {
      newValue = totalPages;
      if (newValue >= totalPages && localStatus === 'reading') {
        setTimeout(() => {
          handleUpdatePages();
        }, 100);
      }
    }
    setReadPages(Math.min(newValue, totalPages || newValue));
  };

  const decrementPages = () => {
    const newValue = Math.max(readPages - 10, 0);
    setReadPages(newValue);
  };

  const pagesLeft = totalPages > 0 ? Math.max(0, totalPages - readPages) : 0;
  const displayProgress = localStatus === 'read' ? 100 : progress;
  const displayReadPages = localStatus === 'read' ? totalPages : readPages;

  const getProgressColor = () => {
    if (displayProgress === 100) return '#27ae60';
    if (displayProgress >= 75) return '#27ae60';
    if (displayProgress >= 50) return '#f39c12';
    if (displayProgress >= 25) return '#3498db';
    return '#c4a265';
  };

  const getStatusText = () => {
    if (displayProgress === 100) return 'Книга прочитана! 🎉';
    if (displayProgress >= 75) return 'Почти финиш!';
    if (displayProgress >= 50) return 'Половина пройдена';
    if (displayProgress >= 25) return 'Хороший темп';
    if (displayProgress > 0) return 'Только начали';
    return 'Начните чтение';
  };

  const getStatusIcon = () => {
    if (displayProgress === 100) return '🏆';
    if (displayProgress >= 75) return '🚀';
    if (displayProgress >= 50) return '📖';
    if (displayProgress >= 25) return '📚';
    return '🎯';
  };

  return (
    <div className={styles.tracker}>
      <h3 className={styles.title}>📖 Прогресс чтения</h3>
      
      <div className={styles.chartContainer}>
        <div className={styles.circularChart}>
          <svg viewBox="0 0 120 120" className={styles.svg}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e8e0d5" strokeWidth="12" className={styles.circleBg} />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - displayProgress / 100)}`}
              strokeLinecap="round"
              className={styles.circleProgress}
            />
          </svg>
          <div className={styles.chartCenter}>
            <span className={styles.percentage}>{displayProgress}%</span>
            <span className={styles.statusIcon}>{getStatusIcon()}</span>
          </div>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>📄 Всего страниц</span>
            <span className={styles.statValue}>{totalPages || '—'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>✅ Прочитано</span>
            <span className={styles.statValue}>{displayReadPages}</span>
          </div>
          {totalPages > 0 && displayProgress < 100 && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>⏳ Осталось</span>
              <span className={styles.statValue}>{pagesLeft}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusIcon}>{getStatusIcon()}</div>
        <div className={styles.statusText}>{getStatusText()}</div>
        <div className={styles.progressPercent}>{displayProgress}%</div>
      </div>

      {totalPages > 0 && (
        <div className={styles.linearProgressContainer}>
          <div className={styles.linearProgressLabel}>
            <span>Начало</span><span>Середина</span><span>Финиш</span>
          </div>
          <div className={styles.linearProgress}>
            <div 
              className={styles.linearProgressFill} 
              style={{ width: `${displayProgress}%`, background: `linear-gradient(90deg, ${getProgressColor()}, ${displayProgress > 50 ? '#27ae60' : getProgressColor()})` }} 
            />
            <div className={styles.progressMarkers}>
              {[25, 50, 75].map(marker => (
                <div 
                  key={marker} 
                  className={`${styles.marker} ${displayProgress >= marker ? styles.markerActive : ''}`} 
                  style={{ left: `${marker}%` }}
                >
                  <span className={styles.markerDot}></span>
                  <span className={styles.markerLabel}>{marker}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {localStatus !== 'read' && (
        <>
          <div className={styles.pageInputContainer}>
            <label className={styles.pageInputLabel}>Введите количество прочитанных страниц:</label>
            <div className={styles.controls}>
              <button onClick={decrementPages} className={styles.controlBtn} disabled={isUpdating}>-10</button>
              <input 
                type="number" 
                value={readPages} 
                onChange={(e) => { 
                  let val = parseInt(e.target.value) || 0; 
                  if (totalPages > 0 && val > totalPages) val = totalPages; 
                  setReadPages(val); 
                }} 
                min="0" 
                max={totalPages || undefined} 
                className={styles.pageInput} 
                disabled={isUpdating} 
              />
              <button onClick={incrementPages} className={styles.controlBtn} disabled={isUpdating}>+10</button>
              <button onClick={handleUpdatePages} className={styles.updateBtn} disabled={isUpdating}>
                {isUpdating ? 'Обновление...' : 'Обновить'}
              </button>
            </div>
          </div>
          
          <div className={styles.quickPresets}>
            <span className={styles.presetLabel}>Быстрые значения:</span>
            <button onClick={() => setReadPages(Math.min(totalPages, 25))} className={styles.presetBtn}>25 стр</button>
            <button onClick={() => setReadPages(Math.min(totalPages, 50))} className={styles.presetBtn}>50 стр</button>
            <button onClick={() => setReadPages(Math.min(totalPages, 100))} className={styles.presetBtn}>100 стр</button>
            {totalPages > 0 && <button onClick={() => setReadPages(totalPages)} className={styles.presetBtnFinish}>Всё</button>}
          </div>
        </>
      )}

      {displayProgress === 100 && (
        <div className={styles.completionMessage}>🎉 Поздравляем! Вы прочитали книгу до конца! 🎉</div>
      )}
      
      {localStatus === 'read' && totalPages > 0 && (
        <div className={styles.completed}>✅ Книга прочитана полностью! {totalPages} страниц осилено!</div>
      )}
      
      {localStatus === 'planned' && totalPages > 0 && (
        <div className={styles.planned}>📅 Книга в планах. Всего страниц: {totalPages}</div>
      )}
      
      {localStatus === 'reading' && totalPages === 0 && (
        <div className={styles.noPages}>📝 Укажите общее количество страниц в настройках книги, чтобы отслеживать прогресс</div>
      )}
    </div>
  );
}