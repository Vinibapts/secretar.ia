import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.15.150:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

export const getEvents = () => api.get('/events/');
export const createEvent = (data) => api.post('/events/', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

export const getTasks = () => api.get('/tasks/');
export const createTask = (data) => api.post('/tasks/', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export const getFinances = () => api.get('/finances/');
export const createFinance = (data) => api.post('/finances/', data);
export const getResumo = () => api.get('/finances/resumo');
export const deleteFinance = (id) => api.delete(`/finances/${id}`);

export const getHabits = () => api.get('/habits/');
export const createHabit = (data) => api.post('/habits/', data);
export const logHabit = (id, data) => api.post(`/habits/${id}/log`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);

export const sendMessage = (data) => api.post('/ai/chat', data);

export default api;