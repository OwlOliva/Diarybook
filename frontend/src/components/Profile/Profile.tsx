import { useState } from 'react';
import { User } from '../../services/api';
import styles from './Profile.module.css';

interface Props {
  user: User;
  onUpdateProfile: (name: string) => Promise<void>;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export default function Profile({ user, onUpdateProfile, onChangePassword, onDeleteAccount }: Props) {
  const [name, setName] = useState(user.name);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile(name);
      setMessage('Имя обновлено');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onChangePassword(oldPassword, newPassword);
      setMessage('Пароль изменен');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
      await onDeleteAccount();
    }
  };

  return (
    <div className={styles.container}>
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.card}>
        <h3>Профиль</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <form onSubmit={handleUpdateName}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
          <button type="submit" className="btn-primary">Обновить имя</button>
        </form>
      </div>

      <div className={styles.card}>
        <h3>Сменить пароль</h3>
        <form onSubmit={handleChangePassword}>
          <input type="password" placeholder="Старый пароль" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
          <input type="password" placeholder="Новый пароль (мин. 6 символов)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <button type="submit" className="btn-primary">Сменить пароль</button>
        </form>
      </div>

      <div className={`${styles.card} ${styles.dangerZone}`}>
        <h3 style={{ color: 'var(--error)' }}>Опасная зона</h3>
        <button onClick={handleDeleteAccount} className={styles.deleteBtn}>Удалить аккаунт</button>
      </div>
    </div>
  );
}