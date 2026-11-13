export const isAdminHost =
  typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');

export function ap(path) {
  if (!isAdminHost) return path;
  return path.replace(/^\/admin/, '') || '/';
}
