import { useState, useEffect } from "react";
import { createEstudiante, getCarreras } from "../api/estudiantes.api";

const ModalNuevoEstudiante = ({ isOpen, onClose, onEstudianteCreado }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    carnet: "",
    email_ucb: "",
    telefono: "",
    id_carrera: "",
    gestion_inicio: "",
    periodo_inicio: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getCarreras();
        setCarreras(res.data);
      } catch (err) {
        console.error("Error al cargar carreras");
      }
    };
    if (isOpen) cargar();
  }, [isOpen]);

  const handleCambio = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (!formData.nombre_completo) {
      setError("El nombre es requerido");
      setCargando(false);
      return;
    }

    try {
      const res = await createEstudiante(formData);
      onEstudianteCreado(res.data);
      setFormData({
        nombre_completo: "",
        carnet: "",
        email_ucb: "",
        telefono: "",
        id_carrera: "",
        gestion_inicio: "",
        periodo_inicio: "",
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear estudiante");
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-200 p-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Nuevo Estudiante
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleCambio}
              placeholder="Ej: Juan Pérez García"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Carnet (opcional)
            </label>
            <input
              type="text"
              name="carnet"
              value={formData.carnet}
              onChange={handleCambio}
              placeholder="Ej: 12345678-1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email UCB (opcional)
            </label>
            <input
              type="email"
              name="email_ucb"
              value={formData.email_ucb}
              onChange={handleCambio}
              placeholder="estudiante@ucb.edu.bo"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleCambio}
              placeholder="Ej: 71234567"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Carrera (opcional)
            </label>
            <select
              name="id_carrera"
              value={formData.id_carrera}
              onChange={handleCambio}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar carrera...</option>
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
          </div>

          {formData.id_carrera && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gestión inicio (opcional)
                </label>
                <input
                  type="number"
                  name="gestion_inicio"
                  value={formData.gestion_inicio}
                  onChange={handleCambio}
                  placeholder="2024"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Período (opcional)
                </label>
                <select
                  name="periodo_inicio"
                  value={formData.periodo_inicio}
                  onChange={handleCambio}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">I</option>
                  <option value="2">II</option>
                </select>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {cargando ? "Creando..." : "Crear Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoEstudiante;
