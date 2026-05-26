import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getAsignacion, deleteAsignacion } from "../../api/asignacion.api";

const EstadoAsignacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asignacion, setAsignacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getAsignacion(id);
        setAsignacion(res.data);
      } catch (err) {
        setError("Asignación no encontrada");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleDesactivar = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta asignación?")) return;
    setGuardando(true);
    try {
      await deleteAsignacion(id);
      navigate("/asignacion");
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar asignación");
    } finally {
      setGuardando(false);
    }
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

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/asignacion"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Estado Asignación
          </h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        {asignacion && (
          <div className="flex flex-col gap-4">
            {/* Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Información de la asignación
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Estudiante</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_completo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo de beca</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_beca}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_area}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Horas por semana</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.horas_semana}h
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha asignación</p>
                  <p className="font-medium text-gray-800">
                    {new Date(asignacion.fecha_asignacion).toLocaleDateString(
                      "es-BO",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Estado actual</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full
                    text-xs font-medium mt-1
                    ${
                      asignacion.estado
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {asignacion.estado ? "ACTIVA" : "INACTIVA"}
                  </span>
                </div>
              </div>
            </div>

            {/* Acción */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Acción
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Al eliminar la asignación el estudiante dejará de estar asignado
                a esta área. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDesactivar}
                  disabled={guardando || !asignacion.estado}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold
                    px-6 py-2.5 rounded-lg transition disabled:opacity-50
                    disabled:cursor-not-allowed"
                >
                  {guardando ? "Eliminando..." : "Eliminar asignación"}
                </button>
                <Link
                  to="/asignacion"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700
                    font-medium px-6 py-2.5 rounded-lg transition"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadoAsignacion;
