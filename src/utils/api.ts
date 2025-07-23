import { API_URL } from './constant';
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'ngrok-skip-browser-warning': 1,
  },
});

export default api;
