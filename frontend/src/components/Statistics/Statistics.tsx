import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Statistics as StatsType } from '../../services/api';
import styles from './Statistics.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Props {
  stats: StatsType;
}

export default function Statistics({ stats }: Props) {
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  
  const barData = {
    labels: stats.countsByMonth.map(item => {
      const [year, month] = item.month.split('-');
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }),
    datasets: [{
      label: 'Прочитано книг',
      data: stats.countsByMonth.map(item => item.count),
      backgroundColor: 'rgba(196, 162, 101, 0.6)',
      borderRadius: 8,
      borderColor: '#8b5a2b',
      borderWidth: 1
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { backgroundColor: '#2c1810' }
    }
  };

  const doughnutData = {
    labels: stats.genreDistribution.map(item => item.genre),
    datasets: [{
      data: stats.genreDistribution.map(item => item.count),
      backgroundColor: ['#c4a265', '#8b5a2b', '#d4a574', '#b8860b', '#cd853f', '#deb887', '#daa520', '#f4a460', '#d2691e', '#a0522d']
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: { backgroundColor: '#2c1810' }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-number">{stats.totalRead}</div>
          <div>Всего прочитано книг</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.averageRating.toFixed(1)}</div>
          <div>Средняя оценка</div>
        </div>
        {stats.totalPages > 0 && (
          <div className="stat-card">
            <div className="stat-number">{stats.totalPages}</div>
            <div>Всего страниц</div>
          </div>
        )}
        {stats.readPages > 0 && (
          <div className="stat-card">
            <div className="stat-number">{stats.readPages}</div>
            <div>Прочитано страниц</div>
          </div>
        )}
      </div>
      
      {stats.countsByMonth.length > 0 && (
        <div className="stat-card">
          <h3>📅 Динамика чтения по месяцам</h3>
          <div className={styles.chartContainer}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      )}

      {stats.genreDistribution.length > 0 && (
        <div className="stat-card">
          <h3>🎭 Любимые жанры</h3>
          <div className={styles.doughnutContainer}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      )}
    </div>
  );
}