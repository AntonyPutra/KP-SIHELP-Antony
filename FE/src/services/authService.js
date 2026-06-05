import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout', {});
  return response.data;
};

export const getProfile = async () => {
  const response = await api.post('/auth/profile', {});
  return response.data;
};
