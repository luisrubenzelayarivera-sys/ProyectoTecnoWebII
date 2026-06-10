import api from "./axios";

export const getUsuarios = (page, limit) =>
  api.get(`/usuarios?page=${page}&limit=${limit}`);
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (datos) => api.post("/usuarios", datos);
export const updateUsuario = (id, datos) => api.put(`/usuarios/${id}`, datos);
export const cambiarPassword = (id, datos) =>
  api.patch(`/usuarios/${id}/password`, datos);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
