// Используем полный URL для разработки
const API_URL = 'https://reader-backend-owloliva.amvera.io/api';
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (options.headers) {
    const optionHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optionHeaders);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на порту 5000');
  }
}

// Auth API
export const register = async (email: string, password: string, name: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse<{ token: string; user: User }>(response);
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string; user: User }>(response);
};
export const updateReadPages = (id: number, readPages: number) =>
  fetchWithAuth<BookEntry>(`/books/${id}/read-pages`, { 
    method: 'PATCH', 
    body: JSON.stringify({ readPages }) 
  });

// Profile API
export const getProfile = () => fetchWithAuth<User>('/profile');
export const updateProfile = (name: string) =>
  fetchWithAuth<User>('/profile', { method: 'PUT', body: JSON.stringify({ name }) });
export const changePassword = (oldPassword: string, newPassword: string) =>
  fetchWithAuth<{ message: string }>('/profile/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
export const deleteAccount = () => fetchWithAuth<void>('/profile', { method: 'DELETE' });

// Books API
export const getBooks = () => fetchWithAuth<BookEntry[]>('/books');
export const getBook = (id: number) => fetchWithAuth<BookEntry>(`/books/${id}`);
export const createBook = async (data: FormData): Promise<BookEntry> => {
  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const response = await fetch(`${API_URL}/books`, { method: 'POST', headers, body: data });
  return handleResponse<BookEntry>(response);
};
export const updateBook = async (id: number, data: FormData): Promise<BookEntry> => {
  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const response = await fetch(`${API_URL}/books/${id}`, { method: 'PUT', headers, body: data });
  return handleResponse<BookEntry>(response);
};
export const deleteBook = (id: number) => fetchWithAuth<void>(`/books/${id}`, { method: 'DELETE' });
export const getStatistics = () => fetchWithAuth<Statistics>('/books/statistics');


export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
  const response = await fetch(`${API_URL}/library/books`);
  return handleResponse<LibraryBook[]>(response);
};

export const getBookDetails = async (id: number): Promise<BookDetails> => {
  const response = await fetch(`${API_URL}/library/books/${id}`);
  return handleResponse<BookDetails>(response);
};

export const addComment = (id: number, comment: string) =>
  fetchWithAuth<BookComment>(`/library/books/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) });
export const addBookToMyLibrary = (bookId: number, data: any) =>
  fetchWithAuth<BookEntry>(`/library/books/${bookId}/add-to-my-library`, { method: 'POST', body: JSON.stringify(data) });

// Genre API
export const getGenres = () => fetchWithAuth<Genre[]>('/genres');

// Arts API
export const getBookArts = (bookId: number) => fetchWithAuth<BookArt[]>(`/arts/books/${bookId}/arts`);
export const addBookArt = async (bookId: number, data: FormData): Promise<BookArt> => {
  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const response = await fetch(`${API_URL}/arts/books/${bookId}/arts`, { method: 'POST', headers, body: data });
  return handleResponse<BookArt>(response);
};
export const deleteBookArt = (artId: number) => fetchWithAuth<void>(`/arts/arts/${artId}`, { method: 'DELETE' });

// Admin API
export const getAdminStats = () => fetchWithAuth<any>('/admin/stats');
export const getAdminUsers = (page: number, search: string) =>
  fetchWithAuth<any>(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
export const updateUserRole = (userId: number, role: string) =>
  fetchWithAuth<any>(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
export const deleteUserAdmin = (userId: number) => fetchWithAuth<void>(`/admin/users/${userId}`, { method: 'DELETE' });
export const getUserById = (id: number) => fetchWithAuth<any>(`/admin/users/${id}`);
export const updateUser = (id: number, data: { name: string; email: string }) =>
  fetchWithAuth<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const getAdminBooks = (page: number, search: string) =>
  fetchWithAuth<any>(`/admin/books?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
export const getBookByIdAdmin = (id: number) => fetchWithAuth<any>(`/admin/books/${id}`);
export const updateBookAdmin = (id: number, data: any) =>
  fetchWithAuth<any>(`/admin/books/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBookAdmin = (bookId: number) => fetchWithAuth<void>(`/admin/books/${bookId}`, { method: 'DELETE' });
export const getAdminComments = (page: number) => fetchWithAuth<any>(`/admin/comments?page=${page}&limit=20`);
export const updateCommentAdmin = (id: number, comment: string) =>
  fetchWithAuth<any>(`/admin/comments/${id}`, { method: 'PUT', body: JSON.stringify({ comment }) });
export const deleteCommentAdmin = (commentId: number) => fetchWithAuth<void>(`/admin/comments/${commentId}`, { method: 'DELETE' });
export const getAdminGenres = () => fetchWithAuth<any[]>('/admin/genres');
export const addGenreAdmin = (name: string) =>
  fetchWithAuth<any>('/admin/genres', { method: 'POST', body: JSON.stringify({ name }) });
export const updateGenre = (id: number, name: string) =>
  fetchWithAuth<any>(`/admin/genres/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
export const deleteGenreAdmin = (genreId: number) => fetchWithAuth<void>(`/admin/genres/${genreId}`, { method: 'DELETE' });
export const getAllArts = (page: number = 1) => fetchWithAuth<any>(`/admin/arts?page=${page}&limit=20`);
export const deleteArtAdmin = (id: number) => fetchWithAuth<void>(`/admin/arts/${id}`, { method: 'DELETE' });

// Типы
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
}

export interface BookEntry {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  genre_id?: number | null;
  status: 'planned' | 'reading' | 'read';
  rating: number | null;
  review: string | null;
  annotation: string | null;
  total_pages: number;
  read_pages: number;
  cover_image: string | null;
  coverImageUrl?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryBook {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  average_rating: number;
  read_count: number;
  cover_image: string | null;
  coverImageUrl?: string | null;
  last_read: string;
  inMyLibrary?: boolean;
  annotation?: string | null;
}

export interface BookComment {
  id: number;
  book_id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface BookDetails extends LibraryBook {
  comments: BookComment[];
}

export interface Statistics {
  totalRead: number;
  averageRating: number;
  countsByMonth: { month: string; count: number }[];
  genreDistribution: { genre: string; count: number }[];
  totalPages: number;
  readPages: number;
}

export interface BookArt {
  id: number;
  book_id: number;
  user_id: number;
  image_url: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  created_at: string;
}

const storedToken = localStorage.getItem('token');
if (storedToken) setAuthToken(storedToken);

