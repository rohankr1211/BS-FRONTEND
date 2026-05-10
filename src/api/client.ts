import axios from 'axios';

const API_BASE_URL = ''; // Use Vite proxy (configured in vite.config.ts)

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request explicitly asked to skip the global redirect (e.g. for best-effort background syncs)
    const config = error.config;
    const skipRedirect = config?._skipRedirect === true;

    if ((error.response?.status === 401 || error.response?.status === 403) && !skipRedirect) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
