import api from './api';

export const getDashboardSummary = async () => {
  const response = await api.post('/dashboard/summary', {});
  return response.data;
};

export const getTicketsByStatus = async () => {
  const response = await api.post('/dashboard/tickets-by-status', {});
  return response.data;
};

export const getTicketsByCategory = async () => {
  const response = await api.post('/dashboard/tickets-by-category', {});
  return response.data;
};

export const getTicketsByPriority = async () => {
  const response = await api.post('/dashboard/tickets-by-priority', {});
  return response.data;
};

export const getTicketsMonthly = async () => {
  const response = await api.post('/dashboard/tickets-monthly', {});
  return response.data;
};
