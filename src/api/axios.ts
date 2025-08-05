import axios from 'axios';

const BASE_URL = 'https://skylab-backend-309zxem12-sabit205s-projects.vercel.app';

// Default export for public routes
export default axios.create({
    baseURL: BASE_URL,
});

// Named export for private routes that require JWT
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});