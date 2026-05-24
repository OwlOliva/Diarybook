import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/AuthForm/AuthForm';
import { register, setAuthToken } from '../../services/api';
import styles from './RegisterPage.module.css';

interface Props {
  onRegister: (token: string) => void;
}

export default function RegisterPage({ onRegister }: Props) {
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const response = await register(email, password, name);
    const { token } = response;
    setAuthToken(token);
    onRegister(token);
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <AuthForm type="register" onSubmit={handleSubmit} />
      <p className={styles.footer}>
        Уже есть аккаунт? <a href="/login">Войдите</a>
      </p>
    </div>
  );
}