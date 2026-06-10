import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBeca, updateBeca } from "../../api/becas.api";

const colorEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":
      return "bg-green-100 text-green-800";
    case "SUSPENDIDA":
      return "bg-yellow-100 text-yellow-800";
    case "FINALIZADA":
      return "bg-gray-100 text-gray-800";
    case "ABANDONADA":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const DetalleBeca = () => {
  const { id } = useParams();
  const [beca, setBeca] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getBeca(id);
        setBeca(res.data);
        setFormData({
          porcentaje: res.data.porcentaje,
          gestion: res.data.gestion,
          periodo: res.data.periodo,
          estado_beca: res.data.estado_beca,
          cod_doc_respaldo: res.data.cod_doc_respaldo || "",
          declaracion_jurada: res.data.declaracion_jurada,
          observaciones: res.data.observaciones || "",
        });
      } catch (err) {
        setError("Beca no encontrada");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await updateBeca(id, formData);
      const res = await getBeca(id);
      setBeca(res.data);
      setEditando(false);
      setError("");
    } catch (err) {
      setError("Error al actualizar la beca");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (cargando)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-20">Cargando...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/becas"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Beca</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {beca && (
          <div className="flex flex-col gap-5">
            {/* Info principal */}
            <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  Información General
                </h2>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${colorEstado(beca.estado_beca)}`}
                  >
                    {beca.estado_beca}
                  </span>
                  {!editando && (
                    <button
                      onClick={() => setEditando(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {!editando ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Estudiante</p>
                    <p className="font-medium text-slate-800">
                      {beca.nombre_completo}
                    </p>
                    {beca.carnet && (
                      <p className="text-xs text-slate-500">{beca.carnet}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Carrera</p>
                    <p className="font-medium text-slate-800">
                      {beca.nombre_carrera || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Tipo de beca</p>
                    <p className="font-medium text-slate-800">
                      {beca.nombre_beca}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Porcentaje</p>
                    <p className="font-medium text-slate-800">
                      {beca.porcentaje}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Gestión / Período</p>
                    <p className="font-medium text-slate-800">
                      {beca.gestion} - {beca.periodo === 1 ? "I" : "II"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Declaración jurada</p>
                    <p className="font-medium text-slate-800">
                      {beca.declaracion_jurada ? "Sí" : "No"}
                    </p>
                  </div>
                  {beca.cod_doc_respaldo && (
                    <div>
                      <p className="text-slate-500 mb-1">Código documento</p>
                      <p className="font-medium text-slate-800">
                        {beca.cod_doc_respaldo}
                      </p>
                    </div>
                  )}
                  {beca.observaciones && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-slate-500 mb-1">Observaciones</p>
                      <p className="font-medium text-slate-800">
                        {beca.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Porcentaje
                      </label>
                      <input
                        type="number"
                        name="porcentaje"
                        value={formData.porcentaje}
                        onChange={handleCambio}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Estado
                      </label>
                      <select
                        name="estado_beca"
                        value={formData.estado_beca}
                        onChange={handleCambio}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="ACTIVA">ACTIVA</option>
                        <option value="SUSPENDIDA">SUSPENDIDA</option>
                        <option value="FINALIZADA">FINALIZADA</option>
                        <option value="ABANDONADA">ABANDONADA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Gestión
                      </label>
                      <input
                        type="number"
                        name="gestion"
                        value={formData.gestion}
                        onChange={handleCambio}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Período
                      </label>
                      <select
                        name="periodo"
                        value={formData.periodo}
                        onChange={handleCambio}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="1">I</option>
                        <option value="2">II</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Código documento respaldo
                    </label>
                    <input
                      type="text"
                      name="cod_doc_respaldo"
                      value={formData.cod_doc_respaldo}
                      onChange={handleCambio}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleCambio}
                      rows="3"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuardar}
                      disabled={guardando}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      onClick={() => setEditando(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Subtipo específico */}
            {beca.subtipo && (
              <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Datos del Subtipo ({beca.subtipo})
                </h2>
                {beca.subtipo === "PROMEDIO" && beca.datosSubtipo && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Promedio mantenido</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.promedio_mantenido}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Gestión obtenido</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.gestion_obtenido}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Semestre obtenido</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.semestre_obtenido}
                      </p>
                    </div>
                  </div>
                )}
                {beca.subtipo === "RESPONSABLE" && beca.datosSubtipo && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">
                        Responsable / Benefactor
                      </p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.responsable_beca}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Hora completo</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.hor_completo ? "Sí" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Antigüedad</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.antiguedad} años
                      </p>
                    </div>
                  </div>
                )}
                {beca.subtipo === "DISCIPLINA" && beca.datosSubtipo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Disciplina</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.nombre_disciplina}
                      </p>
                    </div>
                  </div>
                )}
                {beca.subtipo === "DISCAPACIDAD" && beca.datosSubtipo && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Carnet discapacidad</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.carnet_discapacidad}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Porcentaje</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.porcentaje_disc}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Tipo</p>
                      <p className="font-medium text-slate-800">
                        {beca.datosSubtipo.tipo_disc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Asignación */}
            {beca.asignacion ? (
              <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Asignación
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Área</p>
                    <p className="font-medium text-slate-800">
                      {beca.asignacion.nombre_area}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Horas por semana</p>
                    <p className="font-medium text-slate-800">
                      {beca.asignacion.horas_semana} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Fecha asignación</p>
                    <p className="font-medium text-slate-800">
                      {new Date(
                        beca.asignacion.fecha_asignacion,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-800">
                  <strong>Sin asignación:</strong> Esta beca no tiene un área de
                  trabajo asignada.
                </p>
              </div>
            )}

            {/* Evaluación */}
            {beca.asignacion && beca.evaluacion ? (
              <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Evaluación
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Puntaje de desempeño</p>
                    <p className="font-medium text-slate-800">
                      {beca.evaluacion.puntaje_desempeno}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">
                      Recomienda continuidad
                    </p>
                    <p className="font-medium text-slate-800">
                      {beca.evaluacion.recomienda_continuidad ? "Sí" : "No"}
                    </p>
                  </div>
                  {beca.evaluacion.comentario_jefe_area && (
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">
                        Comentario del jefe de área
                      </p>
                      <p className="font-medium text-slate-800">
                        {beca.evaluacion.comentario_jefe_area}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : beca.asignacion ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-sm text-yellow-800">
                  <strong>Sin evaluación:</strong> La asignación no ha sido
                  evaluada aún.
                </p>
              </div>
            ) : null}

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Acciones
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/becas/${id}/estado`}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cambiar estado
                </Link>
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Editar datos
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleBeca;
