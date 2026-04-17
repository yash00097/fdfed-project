import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export const apiUrl = (path) => baseURL + path;

export default api;
