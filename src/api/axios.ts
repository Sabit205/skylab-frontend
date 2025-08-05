import axios from 'axios';

const BASE_URL = 'http://localhost:3500';

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