import { useState, useEffect, useRef } from 'react';
import { getBookArts, addBookArt, deleteBookArt, BookArt } from '../../services/api';
import { FiUpload, FiTrash2, FiImage, FiX, FiZoomIn, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ArtGallery.module.css';

interface Props {
  bookId: number;
  token: string;
}

export default function ArtGallery({ bookId }: Props) {
  const [arts, setArts] = useState<BookArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedArt, setSelectedArt] = useState<BookArt | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [artTitle, setArtTitle] = useState('');
  const [artDescription, setArtDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [hoveredArt, setHoveredArt] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadArts();
  }, [bookId]);

  useEffect(() => {
    if (selectedArt) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArt]);

  const loadArts = async () => {
    try {
      const data = await getBookArts(bookId);
      setArts(data);
    } catch (error) { console.error('Error loading arts:', error);
    } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    if (artTitle) formData.append('title', artTitle);
    if (artDescription) formData.append('description', artDescription);
    try {
      const newArt = await addBookArt(bookId, formData);
      setArts([newArt, ...arts]);
      setArtTitle('');
      setArtDescription('');
      setShowUploadForm(false);
    } catch (error) { console.error('Error uploading art:', error); alert('Не удалось загрузить изображение');
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDeleteArt = async (artId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот арт?')) {
      try {
        await deleteBookArt(artId);
        setArts(arts.filter(art => art.id !== artId));
        if (selectedArt?.id === artId) { setSelectedArt(null); setSelectedIndex(-1); }
      } catch (error) { console.error('Error deleting art:', error); alert('Не удалось удалить арт'); }
    }
  };

  const openFullscreen = (art: BookArt, index: number) => { setSelectedArt(art); setSelectedIndex(index); };
  const closeFullscreen = () => { setSelectedArt(null); setSelectedIndex(-1); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); if (selectedIndex < arts.length - 1) { setSelectedArt(arts[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); } };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); if (selectedIndex > 0) { setSelectedArt(arts[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); } };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedArt) return;
      if (e.key === 'Escape') closeFullscreen();
      else if (e.key === 'ArrowLeft' && selectedIndex > 0) { setSelectedArt(arts[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }
      else if (e.key === 'ArrowRight' && selectedIndex < arts.length - 1) { setSelectedArt(arts[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArt, selectedIndex, arts]);

  if (loading) return <div className={styles.loading}>Загрузка галереи...</div>;

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <div><h3 className={styles.title}>🎨 Галерея артов <span className={styles.count}>({arts.length})</span></h3>
        <p className={styles.subtitle}>Ваша личная галерея изображений</p></div>
        <button onClick={() => setShowUploadForm(!showUploadForm)} className={`btn-primary ${showUploadForm ? styles.cancelBtn : ''}`}>
          <FiUpload size={18} /> {showUploadForm ? 'Отмена' : 'Добавить арт'}
        </button>
      </div>

      {showUploadForm && (
        <div className={styles.uploadForm}>
          <div className={styles.uploadFormTitle}><h4>Добавить новый арт</h4><button onClick={() => setShowUploadForm(false)}><FiX /></button></div>
          <div className={styles.uploadFormContent}>
            <input type="text" placeholder="Название (опционально)" value={artTitle} onChange={e => setArtTitle(e.target.value)} />
            <textarea placeholder="Описание (опционально)" value={artDescription} onChange={e => setArtDescription(e.target.value)} rows={3} />
            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <FiImage size={32} /><p>Нажмите для выбора изображения</p><small>JPEG, PNG, WEBP, GIF до 10MB</small>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
            {uploading && <div className={styles.uploading}>Загрузка...</div>}
          </div>
        </div>
      )}

      {arts.length === 0 ? (
        <div className={styles.emptyState}><FiImage size={48} /><h3>Здесь пока пусто</h3><p>Добавьте первые арты</p>
        <button onClick={() => setShowUploadForm(true)} className="btn-primary">+ Добавить арт</button></div>
      ) : (
        <div className={styles.masonry}>
          {arts.map((art, idx) => (
            <div key={art.id} className={styles.pin} onMouseEnter={() => setHoveredArt(art.id)} onMouseLeave={() => setHoveredArt(null)}>
              <div className={styles.pinCard} onClick={() => openFullscreen(art, idx)}>
                <img src={art.imageUrl} alt={art.title || 'Art'} className={styles.pinImage} />
                {hoveredArt === art.id && (
                  <div className={styles.pinOverlay}>
                    <button onClick={(e) => { e.stopPropagation(); openFullscreen(art, idx); }} className={styles.overlayBtn}><FiZoomIn size={20} /></button>
                    <button onClick={(e) => handleDeleteArt(art.id, e)} className={`${styles.overlayBtn} ${styles.overlayBtnDelete}`}><FiTrash2 size={20} /></button>
                  </div>
                )}
              </div>
              {(art.title || art.description) && (
                <div className={styles.pinInfo}>
                  {art.title && <p className={styles.pinTitle}>{art.title}</p>}
                  {art.description && <p className={styles.pinDescription}>{art.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedArt && (
        <div className={styles.fullscreen} onClick={closeFullscreen}>
          <button onClick={closeFullscreen} className={styles.fullscreenClose}><FiX size={28} /></button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Удалить этот арт?')) handleDeleteArt(selectedArt.id, e); closeFullscreen(); }} className={styles.fullscreenDelete}><FiTrash2 size={24} /></button>
          {selectedIndex > 0 && <button onClick={prevImage} className={`${styles.fullscreenNav} ${styles.fullscreenNavLeft}`}><FiChevronLeft size={32} /></button>}
          {selectedIndex < arts.length - 1 && <button onClick={nextImage} className={`${styles.fullscreenNav} ${styles.fullscreenNavRight}`}><FiChevronRight size={32} /></button>}
          <img src={selectedArt.imageUrl} alt={selectedArt.title || 'Art'} className={styles.fullscreenImage} onClick={(e) => e.stopPropagation()} />
          {arts.length > 1 && <div className={styles.fullscreenCounter}>{selectedIndex + 1} / {arts.length}</div>}
        </div>
      )}
    </div>
  );
}