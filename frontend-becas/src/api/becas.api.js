import api from "./axios";

export const getBecas              = (page, limit) => api.get(`/becas?page=${page}&limit=${limit}`);
export const getBeca               = (id)          => api.get(`/becas/${id}`);
export const getBecaDetalle        = (id)          => api.get(`/becas/${id}/detalle`);
export const getBecasPorEstudiante = (id)          => api.get(`/becas/by-estudiante/${id}`);
export const createBeca            = (datos)       => api.post("/becas", datos);
export const updateEstadoBeca      = (id, estado_beca) => api.patch(`/becas/${id}/estado`, { estado_beca });
export const deleteBeca            = (id)          => api.delete(`/becas/${id}`);
export const getTiposBeca          = ()            => api.get("/becas/tipos");
export const getDisciplinas        = ()            => api.get("/becas/disciplinas");
export const getListaBecas         = ()            => api.get("/becas/lista");
export const getCategoriasBeca     = ()            => api.get("/becas/categorias");
export const updateBeca            = (id, datos)   => api.patch(`/becas/${id}`, datos);
export const buscarEstudiantes     = (q)           => api.get(`/becas/buscar/estudiantes?q=${encodeURIComponent(q)}`);
export const createBecaContinua    = (id, datos)   => api.post(`/becas/${id}/continua`, datos);
export const getBecaContinua       = (id)          => api.get(`/becas/${id}/continua`);
