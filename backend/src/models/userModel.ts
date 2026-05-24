import { query } from '../config/database';
import { User } from '../types';

export const createUser = async (email: string, passwordHash: string, name: string): Promise<User> => {
  const result = await query(
    'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
    [email, passwordHash, name, 'user']
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<(User & { password_hash: string }) | null> => {
  const result = await query(
    'SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const updateUserName = async (id: number, name: string): Promise<User | null> => {
  const result = await query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, role, created_at',
    [name, id]
  );
  return result.rows[0] || null;
};

export const updateUserPassword = async (id: number, passwordHash: string): Promise<void> => {
  await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );
};

export const deleteUser = async (id: number): Promise<void> => {
  await query('DELETE FROM users WHERE id = $1', [id]);
};