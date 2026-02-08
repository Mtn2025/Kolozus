import axios from "axios";

// Base API Configuration
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response Interceptor for cleaner error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Here we can handle global errors (401, 500)
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);
