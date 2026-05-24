import { useState } from 'react';
import styles from './AuthForm.module.css';

interface Props {
  type: 'login' | 'register';
  onSubmit: (data: { email: string; password: string; name: string }) => Promise<void>;
}

export default function AuthForm({ type, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (type === 'register') {
        if (!name) throw new Error('Имя обязательно');
        await onSubmit({ email, password, name });
      } else {
        // Для логина передаем пустую строку как name
        await onSubmit({ email, password, name: '' });
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при соединении с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>{type === 'login' ? 'Вход' : 'Регистрация'}</h2>
      {error && <div className={styles.error}>{error}</div>}
      {type === 'register' && (
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={styles.input}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className={styles.input}
      />
      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? 'Загрузка...' : type === 'login' ? 'Войти' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}