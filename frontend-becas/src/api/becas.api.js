import api from "./axios";

export const getBecas = (page, limit) =>
  api.get(`/becas?page=${page}&limit=${limit}`);
export const getBeca = (id) => api.get(`/becas/${id}`);
export const createBeca = (datos) => api.post("/becas", datos);
export const updateEstadoBeca = (id, estado_beca) =>
  api.patch(`/becas/${id}/estado`, { estado_beca });
export const deleteBeca = (id) => api.delete(`/becas/${id}`);
export const getTiposBeca = () => api.get("/becas/tipos");
export const getDisciplinas = () => api.get("/becas/disciplinas");
export const getListaBecas = () => api.get("/becas/lista");
