import { useEffect, useState } from 'react';
import { getStatistics, setAuthToken, Statistics } from '../../services/api';
import StatisticsComponent from '../../components/Statistics/Statistics';
import styles from './StatisticsPage.module.css';

interface Props {
  token: string;
}

export default function StatisticsPage({ token }: Props) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    loadStats();
  }, [token]);

  const loadStats = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>📊 Загрузка статистики...</div>;
  if (!stats || stats.totalRead === 0) {
    return (
      <div className={styles.empty}>
        <h2>📖 Статистика чтения</h2>
        <p>У вас пока нет прочитанных книг. Добавьте первую книгу со статусом "Прочитано"!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}><h1>📊 Статистика чтения</h1><p>Ваш прогресс и любимые жанры</p></div>
      <StatisticsComponent stats={stats} />
    </div>
  );
}