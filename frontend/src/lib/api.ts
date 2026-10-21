// =============================================================================
// Dido Store — API Client
// =============================================================================

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      const isLoginRoute = window.location.pathname.includes('/login');
      const isLoginRequest = error.config?.url?.includes('/admin/login');

      if (isAdminRoute && !isLoginRoute && !isLoginRequest) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Get the full URL for a storage file.
 */
export function storageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/storage/')) return path;
  if (path.startsWith('/')) return path;
  return `${API_URL}/storage/${path}`;
}

/**
 * Format price in EGP.
 */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('en-EG')} EGP`;
}

/**
 * Format price in Arabic EGP.
 */
export function formatPriceAr(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('ar-EG')} ج.م`;
}

/**
 * Find the matching product image for a specific color variant.
 * Falls back to primary image or the first available image.
 */
export function getProductImageForColor(
  product?: {
    images?: Array<{
      image_path: string;
      color?: string | null;
      is_primary?: boolean;
    }>;
  } | null,
  color?: string | null
): string | null {
  if (!product || !product.images || product.images.length === 0) {
    return null;
  }

  const images = product.images;

  if (color && typeof color === 'string' && color.trim()) {
    const target = color.trim().toLowerCase();

    // 1. Exact match (case-insensitive & trimmed)
    const exact = images.find(
      (img) => img.color && typeof img.color === 'string' && img.color.trim().toLowerCase() === target
    );
    if (exact) return exact.image_path;

    // 2. Clean alphanumeric match (e.g. "vintage halloween" vs "Vintage-Halloween")
    const cleanTarget = target.replace(/[^a-z0-9]/g, '');
    if (cleanTarget) {
      const cleanMatch = images.find((img) => {
        if (!img.color || typeof img.color !== 'string') return false;
        const cleanColor = img.color.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanColor === cleanTarget;
      });
      if (cleanMatch) return cleanMatch.image_path;
    }

    // 3. Substring match
    const partial = images.find((img) => {
      if (!img.color || typeof img.color !== 'string') return false;
      const c = img.color.trim().toLowerCase();
      return c.includes(target) || target.includes(c);
    });
    if (partial) return partial.image_path;
  }

  // Fallback: Primary image
  const primary = images.find((img) => img.is_primary);
  if (primary) return primary.image_path;

  // Fallback: First image
  return images[0]?.image_path || null;
}
