import { Link, useNavigate } from 'react-router-dom';

interface Props {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>📚 Happy reading</h1>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/">Мои книги</Link>
            <Link to="/library">Библиотека</Link> {/* Новая ссылка */}
            <Link to="/statistics">Статистика</Link>
            <Link to="/profile">Профиль</Link>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Выйти
        </button>
      </div>
    </nav>
  );
}