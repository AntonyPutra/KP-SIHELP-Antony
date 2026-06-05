import api from './api';

export const getUsers = async (params = {}) => {
  const response = await api.post('/users/list', params);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users/create', data);
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.post('/users/detail', { id });
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.post('/users/update', { id, ...data });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.post('/users/delete', { id });
  return response.data;
};
