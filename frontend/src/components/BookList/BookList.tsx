import  type { BookEntry } from '../../types';
import BookCard from '../BookCard/BookCard';

interface Props {
  books: BookEntry[];
  onEdit: (book: BookEntry) => void;
  onDelete: (id: number) => void;
}

export default function BookList({ books, onEdit, onDelete }: Props) {
  if (books.length === 0) {
    return <p>У вас пока нет книг. Добавьте первую!</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {books.map(book => (
        <BookCard key={book.id} book={book} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}