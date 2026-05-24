import { useState } from 'react';

interface Props {
  type: 'login' | 'register';
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>;
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
    
    console.log('Form submitted:', { email, password, name: type === 'register' ? name : undefined });
    
    try {
      if (type === 'register') {
        // Для регистрации name обязателен
        if (!name) {
          throw new Error('Имя обязательно');
        }
        await onSubmit({ email, password, name });
      } else {
        // Для логина name не нужен
        await onSubmit({ email, password });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Ошибка при соединении с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
      <h2>{type === 'login' ? 'Вход' : 'Регистрация'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {type === 'register' && (
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
      />
      <button 
        type="submit" 
        disabled={loading} 
        style={{ width: '100%', padding: '0.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Загрузка...' : type === 'login' ? 'Войти' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}