import api from './api';

export const getTickets = async (params = {}) => {
  const response = await api.post('/tickets/list', params);
  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post('/tickets/create', data);
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.post('/tickets/detail', { id });
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.post('/tickets/update', { id, ...data });
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.post('/tickets/update-status', { id, status });
  return response.data;
};

export const assignTicket = async (id, petugasId) => {
  const response = await api.post('/tickets/assign', { ticket_id: id, user_id: petugasId });
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.post('/tickets/delete', { id });
  return response.data;
};

export const getComments = async (id) => {
  const response = await api.post('/comments/list', { ticket_id: id });
  return response.data;
};

export const createComment = async (id, comment) => {
  const response = await api.post('/comments/create', { ticket_id: id, comment });
  return response.data;
};
