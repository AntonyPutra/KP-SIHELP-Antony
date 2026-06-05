import api from './api';

export const getTickets = async (params) => {
  const response = await api.get('/tickets', { params });
  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post('/tickets', data);
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.patch(`/tickets/${id}/status`, { status });
  return response.data;
};

export const assignTicket = async (id, petugasId) => {
  const response = await api.patch(`/tickets/${id}/assign`, { petugas_id: petugasId });
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export const getComments = async (id) => {
  const response = await api.get(`/tickets/${id}/comments`);
  return response.data;
};

export const createComment = async (id, comment) => {
  const response = await api.post(`/tickets/${id}/comments`, { comment });
  return response.data;
};
