import api from './api';

export const getReportTickets = async (params) => {
  const response = await api.post('/reports/tickets', params);
  return response.data;
};

export const getReportSummary = async (params) => {
  const response = await api.post('/reports/tickets/summary', params);
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.post('/audit-logs/list', params);
  return response.data;
};
