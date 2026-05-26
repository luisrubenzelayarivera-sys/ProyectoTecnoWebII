import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getEstudiantes, deleteEstudiante } from "../../api/estudiantes.api";

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getEstudiantes(p, 10);
      setEstudiantes(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      setError("Error al cargar estudiantes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este estudiante?")) return;
    try {
      await deleteEstudiante(id);
      cargar(page);
    } catch (err) {
      setError("Error al eliminar estudiante");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} registros encontrados
            </p>
          </div>
          <Link
            to="/estudiantes/nuevo"
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2
              rounded-lg text-sm font-medium transition"
          >
            + Nuevo estudiante
          </Link>
        </div>

        {/* Error */}
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
          ) : estudiantes.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No hay estudiantes registrados
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nombre</th>
                  <th className="px-6 py-3 text-left">Carnet</th>
                  <th className="px-6 py-3 text-left">Email UCB</th>
                  <th className="px-6 py-3 text-left">Carrera</th>
                  <th className="px-6 py-3 text-left">Teléfono</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e, i) => (
                  <tr
                    key={e.id_estudiante}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {e.nombre_completo}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {e.carnet ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {e.email_ucb ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {e.nombre_carrera ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {e.telefono ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/estudiantes/${e.id_estudiante}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800
                            px-3 py-1 rounded-lg text-xs font-medium transition"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => handleEliminar(e.id_estudiante)}
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

        {/* Paginación */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => cargar(p)}
        />
      </div>
    </div>
  );
};

export default Estudiantes;
