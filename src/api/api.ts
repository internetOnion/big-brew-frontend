import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            console.error("Network error:", error.message);
            return Promise.reject(error);
        }

        const { status } = error.response;

        if (status === 401) {
            console.warn("Unauthorized");
        }

        if (status === 404) {
            console.warn("Not Found");
        }

        if (status >= 500) {
            console.error("Server error:", error.response.data);
        }

        return Promise.reject(error);
    },
);

export default api;
