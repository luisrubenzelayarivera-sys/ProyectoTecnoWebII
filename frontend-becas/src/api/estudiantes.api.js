import api from "./axios";

export const getEstudiantes = (page, limit) =>
  api.get(`/estudiantes?page=${page}&limit=${limit}`);
export const getEstudiante = (id) => api.get(`/estudiantes/${id}`);
export const createEstudiante = (datos) => api.post("/estudiantes", datos);
export const updateEstudiante = (id, datos) =>
  api.put(`/estudiantes/${id}`, datos);
export const deleteEstudiante = (id) => api.delete(`/estudiantes/${id}`);
export const getListaEstudiantes = () => api.get("/estudiantes/lista");
export const getCarreras = () => api.get("/estudiantes/carreras");
