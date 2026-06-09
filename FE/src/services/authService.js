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

export const requestOTP = async (email, purpose) => {
  const response = await api.post('/auth/request-otp', { email, purpose });
  return response.data;
};

export const verifyOTP = async (otp_session_token, otp, purpose) => {
  const response = await api.post('/auth/verify-otp', { otp_session_token, otp, purpose });
  return response.data;
};

export const resendOTP = async (otp_session_token, purpose) => {
  const response = await api.post('/auth/resend-otp', { otp_session_token, purpose });
  return response.data;
};
