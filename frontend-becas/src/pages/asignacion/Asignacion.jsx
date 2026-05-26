import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getAsignaciones, deleteAsignacion } from "../../api/asignacion.api";

const Asignacion = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getAsignaciones(p, 10);
      setAsignaciones(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      setError("Error al cargar asignaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta asignación?")) return;
    try {
      await deleteAsignacion(id);
      cargar(page);
    } catch (err) {
      setError("Error al eliminar asignación");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Asignaciones</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} registros encontrados
            </p>
          </div>
          <Link
            to="/asignacion/nueva"
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2
              rounded-lg text-sm font-medium transition"
          >
            + Nueva asignación
          </Link>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {cargando ? (
            <p className="text-gray-500 text-center py-10">Cargando...</p>
          ) : asignaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No hay asignaciones registradas
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Estudiante</th>
                  <th className="px-6 py-3 text-left">Tipo beca</th>
                  <th className="px-6 py-3 text-left">Área</th>
                  <th className="px-6 py-3 text-left">Horas/semana</th>
                  <th className="px-6 py-3 text-left">Fecha asignación</th>
                  <th className="px-6 py-3 text-left">Estado beca</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map((a, i) => (
                  <tr
                    key={a.id_asignacion}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {a.nombre_completo}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{a.nombre_beca}</td>
                    <td className="px-6 py-3 text-gray-600">{a.nombre_area}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {a.horas_semana}h
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(a.fecha_asignacion).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          a.estado_beca === "ACTIVA"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {a.estado_beca}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/asignacion/${a.id_asignacion}/evaluacion`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800
                            px-3 py-1 rounded-lg text-xs font-medium transition"
                        >
                          Evaluar
                        </Link>
                        <Link
                          to={`/asignacion/${a.id_asignacion}/estado`}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800
                            px-3 py-1 rounded-lg text-xs font-medium transition"
                        >
                          Estado
                        </Link>
                        <button
                          onClick={() => handleEliminar(a.id_asignacion)}
                          className="bg-red-100 hover:bg-red-200 text-red-700
                            px-3 py-1 rounded-lg text-xs font-medium transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => cargar(p)}
        />
      </div>
    </div>
  );
};

export default Asignacion;
