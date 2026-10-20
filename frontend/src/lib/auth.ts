// =============================================================================
// Dido Store — Auth Helpers
// =============================================================================

import api from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/admin/login', { email, password });
  localStorage.setItem('admin_token', data.token);
  localStorage.setItem('admin_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  api.post('/admin/logout').catch(() => {});
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('admin_user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
