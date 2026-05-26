import api from "./axios";

export const loginApi = (datos) => api.post("/auth/login", datos);
export const logoutApi = (refreshToken) =>
  api.post("/auth/logout", { refreshToken });
export const refreshApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
