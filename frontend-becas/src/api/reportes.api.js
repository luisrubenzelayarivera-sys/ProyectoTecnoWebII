// En un nuevo archivo src/api/reportes.api.js
import api from "./axios";

export const getEstadosBecas = () => api.get("/reportes/estados-becas");
export const getTiposReporte = () => api.get("/reportes/tipos-becas");
export const getEstudiantesConBecas = (page, limit) =>
  api.get(`/reportes/estudiantes-becas?page=${page}&limit=${limit}`);
export const getEvaluaciones = (page, limit) =>
  api.get(`/reportes/evaluaciones?page=${page}&limit=${limit}`);
export const getInfoGeneral = () => api.get("/reportes/info-general");
