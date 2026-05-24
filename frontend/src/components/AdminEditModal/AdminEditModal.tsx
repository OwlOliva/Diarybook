import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from './AdminEditModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    value: any;
    options?: Array<{ value: string; label: string }>;
  }>;
}

export default function AdminEditModal({ isOpen, onClose, onSave, title, fields }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => { initialData[field.name] = field.value; });
    setFormData(initialData);
  }, [fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Ошибка при сохранении');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} className={styles.field}>
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} rows={4} />
              ) : field.type === 'select' ? (
                <select value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input type={field.type} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} />
              )}
            </div>
          ))}
          <div className={styles.actions}>
            <button type="submit" disabled={loading} className={styles.saveBtn}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}