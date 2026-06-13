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
  const ticketId = Number(id);
  const response = await api.post('/tickets/detail', { id: ticketId });
  return response.data;
};

export const updateTicket = async (id, data) => {
  const ticketId = Number(id);
  const response = await api.post('/tickets/update', { id: ticketId, ...data });
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const ticketId = Number(id);
  const response = await api.post('/tickets/update-status', { id: ticketId, status });
  return response.data;
};

export const assignTicket = async (id, petugasId) => {
  const ticketId = Number(id);
  const response = await api.post('/tickets/assign', { ticket_id: ticketId, user_id: petugasId });
  return response.data;
};

export const deleteTicket = async (id) => {
  const ticketId = Number(id);
  const response = await api.post('/tickets/delete', { id: ticketId });
  return response.data;
};

export const getComments = async (id) => {
  const ticketId = Number(id);
  const response = await api.post('/comments/list', { ticket_id: ticketId });
  return response.data;
};

export const createComment = async (id, comment) => {
  const ticketId = Number(id);
  const response = await api.post('/comments/create', { ticket_id: ticketId, comment });
  return response.data;
};
