import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL });

// Attach token from localStorage
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('wo_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect to login on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wo_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me:    ()                 => api.get('/auth/me'),
};

export const rmAPI = {
  dashboard:   () => api.get('/rm/dashboard'),
  bookSummary: () => api.get('/rm/book-summary'),
};

export const customerAPI = {
  list:       (params) => api.get('/customers', { params }),
  get:        (id)     => api.get(`/customers/${id}`),
  create:     (data)   => api.post('/customers', data),
  update:     (id, d)  => api.patch(`/customers/${id}`, d),
  addCommLog: (id, d)  => api.post(`/customers/${id}/comm-log`, d),
};

export const alertAPI = {
  list:    (params) => api.get('/alerts', { params }),
  markRead:(id)     => api.patch(`/alerts/${id}/read`),
  readAll: ()       => api.patch('/alerts/read-all'),
};

export const simAPI = {
  run: (customerId, eventType) => api.post('/simulator/run', { customerId, eventType }),
};

export const txnAPI = {
  list:   ()     => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
};

export const aiAPI = {
  ask:  (question, customerId) => api.post('/ai/ask',  { question, customerId }),
  chat: (message)              => api.post('/ai/chat', { message }),
};

export const auditAPI = {
  list: (params) => api.get('/audit', { params }),
};

export default api;
