import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getEstudiantes, deleteEstudiante } from "../../api/estudiantes.api";
import { buscarEstudiantes } from "../../api/becas.api";
import DropdownMenu from "../../components/DropdownMenu";

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modoHistorial, setModoHistorial] = useState(false);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const navigate = useNavigate();

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getEstudiantes(p, 10);
      setEstudiantes(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      setError("Error al cargar el listado de estudiantes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Confirma la eliminación de este estudiante?")) return;
    try {
      await deleteEstudiante(id);
      cargar(page);
    } catch (err) {
      setError("No se pudo eliminar el estudiante.");
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (busqueda.trim().length < 2) { setError("Ingrese al menos 2 caracteres"); return; }
    setCargandoBusqueda(true);
    setError("");
    try {
      const res = await buscarEstudiantes(busqueda);
      setResultadosBusqueda(res.data);
      setModoHistorial(true);
    } catch (err) {
      setError("Error en la búsqueda");
    } finally {
      setCargandoBusqueda(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Estudiantes</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {modoHistorial
                ? `${resultadosBusqueda.length} resultado${resultadosBusqueda.length !== 1 ? "s" : ""}`
                : `${total} registro${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link to="/estudiantes/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuevo estudiante</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
          <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, carnet o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={cargandoBusqueda}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {cargandoBusqueda ? "Buscando..." : "Buscar"}
              </button>
              {modoHistorial && (
                <button type="button"
                  onClick={() => { setModoHistorial(false); setBusqueda(""); setResultadosBusqueda([]); }}
                  className="flex-1 sm:flex-none border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                  Volver
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
        )}

        {/* Modo Historial */}
        {modoHistorial && (
          <div className="space-y-4 mb-6">
            {resultadosBusqueda.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
                <p className="text-slate-500 text-sm">No se encontraron estudiantes</p>
              </div>
            ) : (
              resultadosBusqueda.map((est) => (
                <div key={est.id_estudiante}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{est.nombre_completo}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {est.carnet && `Carnet: ${est.carnet}`}
                          {est.carnet && est.nombre_carrera && " • "}
                          {est.nombre_carrera}
                        </p>
                        {est.email_ucb && <p className="text-sm text-slate-500">{est.email_ucb}</p>}
                      </div>
                      <Link to={`/estudiantes/${est.id_estudiante}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium shrink-0 ml-4">
                        Ver →
                      </Link>
                    </div>
                    {est.becas && est.becas.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                          Historial de becas ({est.becas.length})
                        </p>
                        <div className="space-y-2">
                          {est.becas.map((beca) => (
                            <div key={beca.id_beca}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 rounded-lg p-3">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{beca.nombre_beca}</p>
                                {beca.subtipo_nombre && (
                                  <p className="text-xs text-slate-500">{beca.subtipo_nombre}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  beca.estado_beca === "ACTIVA" ? "bg-green-100 text-green-800"
                                  : beca.estado_beca === "SUSPENDIDA" ? "bg-yellow-100 text-yellow-800"
                                  : beca.estado_beca === "FINALIZADA" ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-700"
                                }`}>
                                  {beca.estado_beca}
                                </span>
                                <Link to={`/becas/${beca.id_beca}`}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                  Ver →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 italic">Sin historial de becas registrado</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Listado Normal - Cards en mobile, tabla en desktop */}
        {!modoHistorial && (
          <>
            {cargando ? (
              <div className="flex items-center justify-center py-14">
                <p className="text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-14 gap-2">
                <p className="text-slate-400 text-sm">No hay estudiantes registrados</p>
              </div>
            ) : (
              <>
                {/* Tabla desktop */}
                <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Nombre</th>
                        <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Carnet</th>
                        <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Correo UCB</th>
                        <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Carrera</th>
                        <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Teléfono</th>
                        <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {estudiantes.map((e) => (
                        <tr key={e.id_estudiante} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3 font-medium text-slate-800">{e.nombre_completo}</td>
                          <td className="px-5 py-3 text-slate-600">{e.carnet ?? "—"}</td>
                          <td className="px-5 py-3 text-slate-500">{e.email_ucb ?? "—"}</td>
                          <td className="px-5 py-3 text-slate-600">{e.nombre_carrera ?? "—"}</td>
                          <td className="px-5 py-3 text-slate-500">{e.telefono ?? "—"}</td>
                          <td className="px-5 py-3 text-center">
                            <DropdownMenu opciones={[
                              { label: "Ver detalle", icon: "ver", accion: () => navigate(`/estudiantes/${e.id_estudiante}`) },
                              { label: "Eliminar", icon: "borrar", danger: true, accion: () => handleEliminar(e.id_estudiante) },
                            ]} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards mobile */}
                <div className="sm:hidden space-y-3">
                  {estudiantes.map((e) => (
                    <div key={e.id_estudiante} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{e.nombre_completo}</p>
                          {e.carnet && <p className="text-xs text-slate-500 mt-0.5">Carnet: {e.carnet}</p>}
                          {e.nombre_carrera && <p className="text-xs text-slate-500">{e.nombre_carrera}</p>}
                          {e.email_ucb && <p className="text-xs text-slate-400 mt-1 truncate">{e.email_ucb}</p>}
                          {e.telefono && <p className="text-xs text-slate-400">{e.telefono}</p>}
                        </div>
                        <DropdownMenu opciones={[
                          { label: "Ver detalle", icon: "ver", accion: () => navigate(`/estudiantes/${e.id_estudiante}`) },
                          { label: "Eliminar", icon: "borrar", danger: true, accion: () => handleEliminar(e.id_estudiante) },
                        ]} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!modoHistorial && (
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => cargar(p)} />
        )}
      </div>
    </div>
  );
};

export default Estudiantes;
