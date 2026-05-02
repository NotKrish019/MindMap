import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  let token = accessToken;
  if (!token) {
    const tokensStr = sessionStorage.getItem('appid_tokens');
    if (tokensStr) {
      try {
        const tokens = JSON.parse(tokensStr);
        token = tokens.accessToken;
      } catch (e) {
        console.error('Failed to parse tokens from sessionStorage', e);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
