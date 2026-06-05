import api from './api';

export const getReportTickets = async (params) => {
  const response = await api.get('/reports/tickets', { params });
  return response.data;
};

export const getReportSummary = async (params) => {
  const response = await api.get('/reports/tickets/summary', { params });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/audit-logs');
  return response.data;
};
