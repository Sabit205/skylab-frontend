import axios from 'axios';

// The frontend will now read the backend URL from an environment variable.
// In Vercel, this will be VITE_API_BASE_URL.
// The `||` provides a fallback for local development.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500';

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});