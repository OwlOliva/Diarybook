import { useEffect, useState } from 'react';
import { 
  getAdminStats, getAdminUsers, updateUserRole, deleteUserAdmin, getUserById, updateUser,
  getAdminBooks, getBookByIdAdmin, updateBookAdmin, deleteBookAdmin,
  getAdminComments, updateCommentAdmin, deleteCommentAdmin,
  getAdminGenres, addGenreAdmin, updateGenre, deleteGenreAdmin,
  getAllArts, deleteArtAdmin, setAuthToken 
} from '../../services/api';
import AdminEditModal from '../../components/AdminEditModal/AdminEditModal';
import styles from './AdminPage.module.css';

interface Props { token: string; }

export default function AdminPage({ token }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'books' | 'comments' | 'genres' | 'arts' | 'stats'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [arts, setArts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [newGenre, setNewGenre] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFields, setEditFields] = useState<any[]>([]);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => { setAuthToken(token); loadData(); }, [activeTab, page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') setStats(await getAdminStats());
      else if (activeTab === 'users') { const data = await getAdminUsers(page, search); setUsers(data.users); setTotal(data.total); }
      else if (activeTab === 'books') { const data = await getAdminBooks(page, search); setBooks(data.books); setTotal(data.total); }
      else if (activeTab === 'comments') { const data = await getAdminComments(page); setComments(data.comments); setTotal(data.total); }
      else if (activeTab === 'genres') setGenres(await getAdminGenres());
      else if (activeTab === 'arts') { const data = await getAllArts(page); setArts(data.arts); setTotal(data.total); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleEditUser = async (userId: number) => {
    const user = await getUserById(userId);
    setEditingItem(user);
    setEditTitle('Редактирование пользователя');
    setEditFields([
      { name: 'name', label: 'Имя', type: 'text', value: user.name },
      { name: 'email', label: 'Email', type: 'text', value: user.email },
      { name: 'role', label: 'Роль', type: 'select', value: user.role, options: [{ value: 'user', label: 'Пользователь' }, { value: 'admin', label: 'Администратор' }] }
    ]);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (data: any) => { await updateUser(editingItem.id, data); await loadData(); };
  const handleEditBook = async (bookId: number) => {
    const book = await getBookByIdAdmin(bookId);
    setEditingItem(book);
    setEditTitle('Редактирование книги');
    setEditFields([
      { name: 'title', label: 'Название', type: 'text', value: book.title },
      { name: 'author', label: 'Автор', type: 'text', value: book.author },
      { name: 'status', label: 'Статус', type: 'select', value: book.status, options: [{ value: 'planned', label: 'Запланировано' }, { value: 'reading', label: 'Читаю' }, { value: 'read', label: 'Прочитано' }] },
      { name: 'rating', label: 'Оценка', type: 'number', value: book.rating },
      { name: 'annotation', label: 'Аннотация', type: 'textarea', value: book.annotation }
    ]);
    setEditModalOpen(true);
  };
  const handleSaveBook = async (data: any) => { await updateBookAdmin(editingItem.id, data); await loadData(); };
  const handleEditComment = async (comment: any) => {
    setEditingItem(comment);
    setEditTitle('Редактирование комментария');
    setEditFields([{ name: 'comment', label: 'Комментарий', type: 'textarea', value: comment.comment }]);
    setEditModalOpen(true);
  };
  const handleSaveComment = async (data: any) => { await updateCommentAdmin(editingItem.id, data.comment); await loadData(); };
  const handleEditGenre = async (genre: any) => {
    setEditingItem(genre);
    setEditTitle('Редактирование жанра');
    setEditFields([{ name: 'name', label: 'Название', type: 'text', value: genre.name }]);
    setEditModalOpen(true);
  };
  const handleSaveGenre = async (data: any) => { await updateGenre(editingItem.id, data.name); await loadData(); };
  const handleDeleteUser = async (id: number) => { if (confirm('Удалить пользователя?')) { await deleteUserAdmin(id); loadData(); } };
  const handleDeleteBook = async (id: number) => { if (confirm('Удалить книгу?')) { await deleteBookAdmin(id); loadData(); } };
  const handleDeleteComment = async (id: number) => { if (confirm('Удалить комментарий?')) { await deleteCommentAdmin(id); loadData(); } };
  const handleDeleteGenre = async (id: number) => { if (confirm('Удалить жанр?')) { await deleteGenreAdmin(id); loadData(); } };
  const handleDeleteArt = async (id: number) => { if (confirm('Удалить арт?')) { await deleteArtAdmin(id); loadData(); } };
  const handleAddGenre = async () => { if (newGenre.trim()) { await addGenreAdmin(newGenre); setNewGenre(''); loadData(); } };

  if (loading && activeTab !== 'stats') return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1>🔧 Админ-панель</h1>
      <div className={styles.tabs}>
        {['stats', 'users', 'books', 'comments', 'genres', 'arts'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab as any); setPage(1); setSearch(''); }} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}>
            {tab === 'stats' && '📊 Статистика'}{tab === 'users' && '👥 Пользователи'}{tab === 'books' && '📚 Книги'}{tab === 'comments' && '💬 Комментарии'}{tab === 'genres' && '🏷️ Жанры'}{tab === 'arts' && '🎨 Арты'}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && stats && (
        <div className={styles.statsGrid}>
          <div className="stat-card"><div className="stat-number">{stats.total_users}</div><div>Пользователей</div></div>
          <div className="stat-card"><div className="stat-number">{stats.admin_users}</div><div>Администраторов</div></div>
          <div className="stat-card"><div className="stat-number">{stats.total_books}</div><div>Книг</div></div>
          <div className="stat-card"><div className="stat-number">{stats.read_books}</div><div>Прочитано</div></div>
          <div className="stat-card"><div className="stat-number">{stats.total_comments}</div><div>Комментариев</div></div>
          <div className="stat-card"><div className="stat-number">{stats.total_arts}</div><div>Артов</div></div>
          <div className="stat-card"><div className="stat-number">{stats.total_genres}</div><div>Жанров</div></div>
        </div>
      )}

      {activeTab === 'users' && (
        <>
          <input type="text" placeholder="Поиск..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} />
          <div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Действия</th></tr></thead>
          <tbody>{users.map(user => (<tr key={user.id}><td>{user.id}</td><td>{user.name}</td><td>{user.email}</td>
          <td><select value={user.role} onChange={e => updateUserRole(user.id, e.target.value)}><option value="user">Пользователь</option><option value="admin">Администратор</option></select></td>
          <td><button onClick={() => handleEditUser(user.id)}>✏️</button><button onClick={() => handleDeleteUser(user.id)}>🗑️</button></td></tr>))}</tbody></table></div>
        </>
      )}

      {activeTab === 'books' && (
        <>
          <input type="text" placeholder="Поиск..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} />
          <div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>ID</th><th>Название</th><th>Автор</th><th>Пользователь</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>{books.map(book => (<tr key={book.id}><td>{book.id}</td><td>{book.title}</td><td>{book.author}</td><td>{book.user_name || book.user_email}</td>
          <td>{book.status === 'read' ? '✅ Прочитано' : book.status === 'reading' ? '📖 Читаю' : '📅 Запланировано'}</td>
          <td><button onClick={() => handleEditBook(book.id)}>✏️</button><button onClick={() => handleDeleteBook(book.id)}>🗑️</button></td></tr>))}</tbody></table></div>
        </>
      )}

      {activeTab === 'comments' && (
        <div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>ID</th><th>Пользователь</th><th>Книга</th><th>Комментарий</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody>{comments.map(comment => (<tr key={comment.id}><td>{comment.id}</td><td>{comment.user_name}</td><td>{comment.book_title}</td><td>{comment.comment.substring(0, 50)}...</td>
        <td>{new Date(comment.created_at).toLocaleDateString()}</td><td><button onClick={() => handleEditComment(comment)}>✏️</button><button onClick={() => handleDeleteComment(comment.id)}>🗑️</button></td></tr>))}</tbody></table></div>
      )}

      {activeTab === 'genres' && (
        <><div className={styles.addGenre}><input type="text" placeholder="Новый жанр" value={newGenre} onChange={e => setNewGenre(e.target.value)} /><button onClick={handleAddGenre} className="btn-primary">+ Добавить</button></div>
        <div className={styles.genreList}>{genres.map(genre => (<div key={genre.id} className={styles.genreItem}><span>{genre.name}</span><div><button onClick={() => handleEditGenre(genre)}>✏️</button><button onClick={() => handleDeleteGenre(genre.id)}>🗑️</button></div></div>))}</div></>
      )}

      {activeTab === 'arts' && (
        <div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>ID</th><th>Пользователь</th><th>Книга</th><th>Изображение</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody>{arts.map(art => (<tr key={art.id}><td>{art.id}</td><td>{art.user_name}</td><td>{art.book_title}</td><td><a href={art.image_url} target="_blank">Просмотр</a></td>
        <td>{new Date(art.created_at).toLocaleDateString()}</td><td><button onClick={() => handleDeleteArt(art.id)}>🗑️</button></td></tr>))}</tbody></table></div>
      )}

      <AdminEditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSave={activeTab === 'users' ? handleSaveUser : activeTab === 'books' ? handleSaveBook : activeTab === 'comments' ? handleSaveComment : handleSaveGenre} title={editTitle} fields={editFields} />
    </div>
  );
}