import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword, deleteAccount, setAuthToken, User } from '../../services/api';
import ProfileComponent from '../../components/Profile/Profile';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

interface Props {
  token: string;
}

export default function ProfilePage({ token }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthToken(token);
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async (name: string) => {
    const updatedUser = await updateProfile(name);
    setUser(updatedUser);
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await changePassword(oldPassword, newPassword);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div className={styles.loading}>👤 Загрузка профиля...</div>;

  return (
    <div className={styles.container}>
      <ProfileComponent user={user} onUpdateProfile={handleUpdateProfile} onChangePassword={handleChangePassword} onDeleteAccount={handleDeleteAccount} />
    </div>
  );
}