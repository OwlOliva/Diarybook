export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at?: string;
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

export interface Statistics {
  totalRead: number;
  averageRating: number;
  countsByMonth: { month: string; count: number }[];
  genreDistribution: { genre: string; count: number }[];
  totalPages: number;
  readPages: number;
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