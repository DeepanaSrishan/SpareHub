import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080/api",
=======
    baseURL: "http://localhost:8080/api",
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token =
<<<<<<< HEAD
            localStorage.getItem("sparehub_access_token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token");
=======
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

<<<<<<< HEAD
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.url?.includes("/auth/login")
        ) {
            console.warn("Authentication required or expired:", error.config?.url);
        }
        return Promise.reject(error);
    }
);

=======
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
export default api;