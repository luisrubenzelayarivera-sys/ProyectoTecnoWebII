import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getAsignaciones, deleteAsignacion } from "../../api/asignacion.api";
import DropdownMenu from "../../components/DropdownMenu";

const Asignacion = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => { cargar(); }, []);

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Asignaciones</h1>
            <p className="text-gray-500 text-sm mt-1">{total} registros encontrados</p>
          </div>
          <Link to="/asignacion/nueva"
            className="bg-blue-800 hover:bg-blue-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition">
            + <span className="hidden sm:inline">Nueva asignación</span><span className="sm:hidden">Nueva</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
        )}

        {cargando ? (
          <div className="bg-white rounded-2xl shadow flex items-center justify-center py-14">
            <p className="text-gray-500 text-sm">Cargando...</p>
          </div>
        ) : asignaciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow flex items-center justify-center py-14">
            <p className="text-gray-500 text-sm">No hay asignaciones registradas</p>
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block bg-white rounded-2xl shadow overflow-x-auto">
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
                    <tr key={a.id_asignacion} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-3 font-medium text-gray-800">{a.nombre_completo}</td>
                      <td className="px-6 py-3 text-gray-600">{a.nombre_beca}</td>
                      <td className="px-6 py-3 text-gray-600">{a.nombre_area}</td>
                      <td className="px-6 py-3 text-gray-600">{a.horas_semana}h</td>
                      <td className="px-6 py-3 text-gray-600">{new Date(a.fecha_asignacion).toLocaleDateString("es-BO")}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.estado_beca === "ACTIVA" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {a.estado_beca}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <DropdownMenu opciones={[
                          { label: "Evaluar", icon: "ver",    accion: () => navigate(`/asignacion/${a.id_asignacion}/evaluacion`) },
                          { label: "Estado",  icon: "estado", accion: () => navigate(`/asignacion/${a.id_asignacion}/estado`) },
                          { label: "Eliminar",icon: "borrar", danger: true, accion: () => handleEliminar(a.id_asignacion) },
                        ]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="sm:hidden space-y-3">
              {asignaciones.map((a) => (
                <div key={a.id_asignacion} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{a.nombre_completo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.nombre_beca} · {a.nombre_area}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.estado_beca === "ACTIVA" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {a.estado_beca}
                        </span>
                        <span className="text-xs text-gray-400">{a.horas_semana}h/semana</span>
                        <span className="text-xs text-gray-400">{new Date(a.fecha_asignacion).toLocaleDateString("es-BO")}</span>
                      </div>
                    </div>
                    <DropdownMenu opciones={[
                      { label: "Evaluar", icon: "ver",    accion: () => navigate(`/asignacion/${a.id_asignacion}/evaluacion`) },
                      { label: "Estado",  icon: "estado", accion: () => navigate(`/asignacion/${a.id_asignacion}/estado`) },
                      { label: "Eliminar",icon: "borrar", danger: true, accion: () => handleEliminar(a.id_asignacion) },
                    ]} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => cargar(p)} />
      </div>
    </div>
  );
};

export default Asignacion;
