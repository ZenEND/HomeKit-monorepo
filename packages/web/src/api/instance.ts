import axios from "axios";

export const AUTH_TOKEN_KEY = 'homekit.authToken';

export const getAuthToken = () => {
    if (typeof window === 'undefined') return null;

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

apiInstance.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
});