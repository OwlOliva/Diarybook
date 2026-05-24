import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LibraryPage from './pages/LibraryPage/LibraryPage';
import BookDetailsPage from './pages/BookDetailsPage/BookDetailsPage';
import MyBookDetailsPage from './pages/MyBookDetailsPage/MyBookDetailsPage';
import AdminPage from './pages/AdminPage/AdminPage';
import Sidebar from './components/Sidebar/Sidebar';
import { setAuthToken, getProfile, User } from './services/api';
import './styles/global.css';

function App() {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('token');
    return stored || null;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      loadUser();
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Публичные маршруты (доступны без авторизации)
  const publicRoutes = (
    <>
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/library/book/:id" element={<BookDetailsPage />} />
      <Route path="/login" element={<LoginPage onLogin={setToken} />} />
      <Route path="/register" element={<RegisterPage onRegister={setToken} />} />
    </>
  );

  // Приватные маршруты (требуют авторизации)
  const privateRoutes = token ? (
    <>
      <Route path="/" element={<DashboardPage token={token} />} />
      <Route path="/my-book/:id" element={<MyBookDetailsPage token={token} />} />
      <Route path="/statistics" element={<StatisticsPage token={token} />} />
      <Route path="/profile" element={<ProfilePage token={token} />} />
      {user?.role === 'admin' && <Route path="/admin" element={<AdminPage token={token} />} />}
    </>
  ) : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f0eb 0%, #e8e0d5 100%)',
      display: 'flex'
    }}>
      <BrowserRouter>
        {/* Sidebar показываем всегда, но с разными пунктами меню */}
        <Sidebar 
          onLogout={() => setToken(null)} 
          onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)}
          userRole={user?.role}
          isAuthenticated={!!token}
        />
        <div style={{ 
          marginLeft: isSidebarCollapsed ? '80px' : '280px',
          padding: '2rem',
          flex: 1,
          minHeight: 'calc(100vh - 4rem)',
          transition: 'margin-left 0.3s ease'
        }}>
          <Routes>
            {publicRoutes}
            {privateRoutes}
            <Route path="*" element={<Navigate to={token ? '/' : '/library'} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;