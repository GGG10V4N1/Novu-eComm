import axios from "axios";

const JWT_COOKIE_NAME = "ecomm-cookie";

const clearJwtCookie = () => {
    document.cookie = `${JWT_COOKIE_NAME}=; path=/ecomApi; max-age=0`;
    document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${JWT_COOKIE_NAME}=; path=/ecomApi/; max-age=0`;
};

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/ecomApi`,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        const method = (error?.config?.method || "get").toLowerCase();

        if (status === 401) {
            const isAuthEndpoint =
                url.startsWith("/auth/signin") ||
                url.startsWith("/auth/signup") ||
                url.startsWith("/auth/user");

            if (isAuthEndpoint && method === "get") {
                return Promise.reject(error);
            }

            clearJwtCookie();

            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                const redirect = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.assign(`/login?session=expired&from=${redirect}`);
            }
        }

        return Promise.reject(error);
    }
);

export default api;