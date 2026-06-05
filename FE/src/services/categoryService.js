import api from './api';

export const getCategories = async (params = {}) => {
  const response = await api.post('/categories/list', params);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories/create', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.post('/categories/update', { id, ...data });
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.post('/categories/delete', { id });
  return response.data;
};
