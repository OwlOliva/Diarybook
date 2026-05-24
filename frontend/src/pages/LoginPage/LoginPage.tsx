import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/AuthForm/AuthForm';
import { login, setAuthToken } from '../../services/api';
import styles from './LoginPage.module.css';

interface Props {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password }: { email: string; password: string; name: string }) => {
    try {
      const response = await login(email, password);
      const { token } = response;
      setAuthToken(token);
      onLogin(token);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return (
    <div className={styles.container}>
      <AuthForm type="login" onSubmit={handleSubmit} />
      <p className={styles.footer}>
        Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
      </p>
    </div>
  );
}