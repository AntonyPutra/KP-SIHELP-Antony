export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getRoleId = (user) => {
  if (!user) return 3; // Default to User
  if (user.role_id) return Number(user.role_id);
  if (user.role !== undefined && user.role !== null) {
    const r = user.role;
    if (typeof r === 'number') return r;
    if (!isNaN(r)) return Number(r);
    const rLower = String(r).toLowerCase();
    if (rLower.includes('admin')) return 1;
    if (rLower.includes('petugas')) return 2;
    if (rLower.includes('pimpinan')) return 4;
  }
  return 3; // Default to User
};
