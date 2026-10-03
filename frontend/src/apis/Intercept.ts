import axios from "axios";
import TokenService from "./tokenservice"; 

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const HttpClient = axios.create({
  baseURL: `${backendUrl}/api`,
  timeout: 2 * 60 * 1000,
  withCredentials: true,
});

let refreshRequest: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const response = await axios.post<{ accessToken: string }>(
    `${backendUrl}/api/auth/refresh`,
    {},
    { withCredentials: true },
  );
  TokenService.setToken({ access: response.data.accessToken });
  return response.data.accessToken;
};

HttpClient.interceptors.request.use(async (config) => {
  const token = TokenService.getToken();
  if (token?.access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token.access}`;
  }
  return config;
});

HttpClient.interceptors.response.use(
  async (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        refreshRequest ??= refreshAccessToken().finally(() => {
          refreshRequest = null;
        });
        const accessToken = await refreshRequest;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return HttpClient(originalRequest);
      } catch {
        TokenService.clearToken();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default HttpClient;