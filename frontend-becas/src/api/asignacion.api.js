import api from "./axios";

export const getAsignaciones = (page, limit) =>
  api.get(`/asignacion?page=${page}&limit=${limit}`);
export const getAsignacion = (id) => api.get(`/asignacion/${id}`);
export const createAsignacion = (datos) => api.post("/asignacion", datos);
export const evaluarAsignacion = (id, datos) =>
  api.patch(`/asignacion/${id}/evaluacion`, datos);
export const deleteAsignacion = (id) => api.delete(`/asignacion/${id}`);
export const getAreas = () => api.get("/asignacion/areas");
