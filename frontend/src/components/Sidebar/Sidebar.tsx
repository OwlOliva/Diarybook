import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiBook, 
  FiHome, 
  FiBarChart2, 
  FiUser, 
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiChevronLeft,
  FiBookOpen,
  FiTrendingUp,
  FiLock
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

interface Props {
  onLogout: () => void;
  onToggle?: (isCollapsed: boolean) => void;
  userRole?: 'user' | 'admin';
  isAuthenticated?: boolean;
}

export default function Sidebar({ onLogout, onToggle, userRole, isAuthenticated = false }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  // Базовые пункты меню для всех пользователей (публичные страницы)
  const publicMenuItems = [
    { path: '/library', icon: FiBookOpen, label: 'Библиотека' },
  ];

  // Приватные пункты меню (только для авторизованных)
  const privateMenuItems = isAuthenticated ? [
    { path: '/', icon: FiHome, label: 'Главная' },
    { path: '/statistics', icon: FiBarChart2, label: 'Статистика' },
    { path: '/profile', icon: FiUser, label: 'Профиль' },
  ] : [];

  // Добавляем админ-панель только для администраторов
  if (userRole === 'admin') {
    privateMenuItems.push({ path: '/admin', icon: FiLock, label: 'Админ-панель' });
  }

  // Объединяем все пункты меню
  const menuItems = [...publicMenuItems, ...privateMenuItems];

  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      {isMobile && (
        <button onClick={toggleSidebar} className={styles.menuBtn}>
          <FiMenu size={24} />
        </button>
      )}

      <div className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        <div className={`${styles.logo} ${isCollapsed ? styles.logoCollapsed : styles.logoExpanded}`}>
          {isCollapsed ? (
            <FiBook size={32} className={styles.logoIcon} />
          ) : (
            <>
              <h2 className={styles.logoTitle}>📚 Happy</h2>
              <h2 className={styles.logoSubtitle}>Reading</h2>
            </>
          )}
        </div>

        {!isMobile && (
          <button onClick={toggleSidebar} className={styles.toggleBtn}>
            {isCollapsed ? <FiMenu size={14} /> : <FiChevronLeft size={14} />}
          </button>
        )}

        <nav className={`${styles.nav} ${isCollapsed ? styles.navCollapsed : styles.navExpanded}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isCollapsed ? styles.navLinkCollapsed : styles.navLinkExpanded} ${active ? styles.navLinkActive : styles.navLinkInactive}`}
              >
                <Icon size={22} />
                {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Блок для неавторизованных пользователей */}
        {!isAuthenticated && (
          <div className={styles.authButtons}>
            <button onClick={handleLogin} className={styles.loginBtn}>
              <FiLogIn size={18} />
              {!isCollapsed && <span>Войти</span>}
            </button>
            <button onClick={handleRegister} className={styles.registerBtn}>
              <FiUserPlus size={18} />
              {!isCollapsed && <span>Регистрация</span>}
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className={styles.footer}>
            <div className={styles.logoIcon}>
              <FiTrendingUp size={20} />
            </div>
          </div>
        )}

        {/* Кнопка выхода для авторизованных пользователей */}
        {isAuthenticated && (
          <div className={styles.footer}>
            <button
              onClick={onLogout}
              className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : styles.logoutBtnExpanded}`}
            >
              <FiLogOut size={20} />
              {!isCollapsed && <span>Выйти</span>}
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && isMobile && (
        <div onClick={toggleSidebar} className={styles.overlay} />
      )}
    </>
  );
}