import api from './api';

export const generateTicketSuggestion = async (payload) => {
  const response = await api.post('/ai/ticket-suggestion', payload);
  return response.data;
};

export const generateTicketSummary = async (ticketId) => {
  const response = await api.post('/ai/ticket-summary', { ticket_id: Number(ticketId) });
  return response.data;
};

export const generateReplySuggestion = async (ticketId, tone) => {
  const response = await api.post('/ai/reply-suggestion', { ticket_id: Number(ticketId), tone });
  return response.data;
};
