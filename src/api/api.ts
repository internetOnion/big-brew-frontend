import axios from "axios";
import { toast } from "sonner";
import { ENDPOINTS } from "./endpoints";

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

let onTokenRefreshed: ((token: string) => void) | null = null;
export const setOnTokenRefreshed = (cb: ((token: string) => void) | null) => {
    onTokenRefreshed = cb;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            if (error.code === "ECONNABORTED") {
                toast.error("Request timed out. Please try again");
            } else {
                toast.error("Network error. Check your connection");
            }
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        const { status } = error.response;

        if (status === 401 && !originalRequest._retry) {
            const url = originalRequest.url || "";
            if (
                url.includes("/auth/login") ||
                url.includes("/auth/terminal-login")
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${api.defaults.baseURL}${ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    {
                        withCredentials: true,
                        headers: { "Content-Type": "application/json" },
                    },
                );

                const newToken = data.data?.access_token;
                setAccessToken(newToken);
                processQueue(null, newToken);

                if (onTokenRefreshed) {
                    onTokenRefreshed(newToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAccessToken(null);
                if (!error.config?.silent) {
                    toast.error(
                        "Your session has expired. Please log in again",
                    );
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (status === 403) {
            toast.error("You don't have permission to do that");
        }

        if (status === 404) {
            toast.error("Resource not found");
        }

        if (status >= 500) {
            toast.error("Something went wrong. Please try again later");
        }

        return Promise.reject(error);
    },
);

export default api;
