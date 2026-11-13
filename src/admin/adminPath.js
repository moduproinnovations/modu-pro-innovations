export const isAdminHost =
  typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');

export function ap(path) {
  if (typeof window === 'undefined') return path;
  if (!isAdminHost && window.location.pathname.startsWith('/admin')) {
    return path.startsWith('/admin') ? path : `/admin${path}`;
  }
  if (!isAdminHost) return path;
  return path.replace(/^\/admin/, '') || '/';
}
