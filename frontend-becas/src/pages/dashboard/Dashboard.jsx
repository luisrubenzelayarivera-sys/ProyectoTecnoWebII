import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import {
  getEstadosBecas,
  getTiposReporte,
  getEvaluaciones,
  getInfoGeneral,
} from "../../api/reportes.api";

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

const Dashboard = () => {
  const [estadosBecas, setEstadosBecas] = useState([]);
  const [tiposBecas, setTiposBecas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [infoGeneral, setInfoGeneral] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Filtros dashboard
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");

  // Paginación evaluaciones
  const [pageEval, setPageEval] = useState(1);
  const [totalPagesEval, setTotalPagesEval] = useState(1);

  // Tab activo
  const [tab, setTab] = useState("resumen");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [estados, tipos, evals, info] = await Promise.all([
          getEstadosBecas(),
          getTiposReporte(),
          getEvaluaciones(1, 5),
          getInfoGeneral(),
        ]);
        setEstadosBecas(estados.data);
        setTiposBecas(tipos.data);
        setEvaluaciones(evals.data.data);
        setTotalPagesEval(evals.data.totalPages);
        setInfoGeneral(info.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const cargarEvaluaciones = async (p) => {
    const res = await getEvaluaciones(p, 5);
    setEvaluaciones(res.data.data);
    setTotalPagesEval(res.data.totalPages);
    setPageEval(p);
  };

  // Filtros sobre tipos de beca
  const tiposFiltrados = tiposBecas
    .filter((t) => !filtroTipo || t.nombre_beca === filtroTipo)
    .filter((t) => !filtroPeriodo || true); // periodo se aplica en BD, aquí es ilustrativo

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: "resumen", label: "Resumen" },
            { key: "evaluaciones", label: "Evaluaciones" },
            { key: "info", label: "Carreras y Áreas" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition
                ${
                  tab === t.key
                    ? "border-blue-800 text-blue-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <>
            {/* TAB RESUMEN */}
            {tab === "resumen" && (
              <div className="flex flex-col gap-6">
                {/* Filtros */}
                <div className="flex gap-3 items-center">
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    {tiposBecas.map((t) => (
                      <option key={t.nombre_beca} value={t.nombre_beca}>
                        {t.nombre_beca}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los periodos</option>
                    <option value="1">Periodo I</option>
                    <option value="2">Periodo II</option>
                  </select>

                  {(filtroTipo || filtroPeriodo) && (
                    <button
                      onClick={() => {
                        setFiltroTipo("");
                        setFiltroPeriodo("");
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      ✕ Limpiar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estados */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                      Becas por estado
                    </h2>
                    <div className="flex flex-col gap-3">
                      {estadosBecas.map((item) => (
                        <div
                          key={item.estado_beca}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={`px-3 py-1 rounded-full text-sm
                            font-medium ${colorEstado(item.estado_beca)}`}
                          >
                            {item.estado_beca}
                          </span>
                          <span className="text-gray-800 font-bold text-lg">
                            {item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tipos filtrados */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                      Becas por tipo
                    </h2>
                    <div className="flex flex-col gap-3">
                      {tiposFiltrados.map((item) => (
                        <div
                          key={item.nombre_beca}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <span className="text-sm text-gray-600">
                            {item.nombre_beca}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              Prom: {item.promedio_porcentaje ?? "—"}%
                            </span>
                            <span
                              className="bg-blue-100 text-blue-800 px-2 py-0.5
                              rounded-full text-sm font-semibold"
                            >
                              {item.total}
                            </span>
                          </div>
                        </div>
                      ))}
                      {tiposFiltrados.length === 0 && (
                        <p className="text-gray-400 text-sm">
                          No hay datos para este filtro
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB EVALUACIONES */}
            {tab === "evaluaciones" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  {evaluaciones.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                      No hay evaluaciones registradas
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-blue-800 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left">Estudiante</th>
                          <th className="px-6 py-3 text-left">Área</th>
                          <th className="px-6 py-3 text-left">Tipo beca</th>
                          <th className="px-6 py-3 text-left">Puntaje</th>
                          <th className="px-6 py-3 text-left">Continuidad</th>
                          <th className="px-6 py-3 text-left">Comentario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluaciones.map((ev, i) => (
                          <tr
                            key={ev.id_evaluacion}
                            className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="px-6 py-3 font-medium text-gray-800">
                              {ev.nombre_completo}
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {ev.nombre_area}
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {ev.nombre_beca}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full
                                      ${
                                        ev.puntaje_desempeno >= 75
                                          ? "bg-green-500"
                                          : ev.puntaje_desempeno >= 50
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                    style={{
                                      width: `${ev.puntaje_desempeno}%`,
                                    }}
                                  />
                                </div>
                                <span className="font-semibold text-gray-800">
                                  {ev.puntaje_desempeno}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs
                                font-medium
                                ${
                                  ev.recomienda_continuidad
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {ev.recomienda_continuidad ? "Sí" : "No"}
                              </span>
                            </td>
                            <td
                              className="px-6 py-3 text-gray-500 text-xs
                              max-w-xs truncate"
                            >
                              {ev.comentario_jefe_area ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <Pagination
                  page={pageEval}
                  totalPages={totalPagesEval}
                  onPageChange={cargarEvaluaciones}
                />
              </div>
            )}

            {/* TAB INFO GENERAL */}
            {tab === "info" && infoGeneral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carreras */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Carreras
                  </h2>
                  <div className="flex flex-col gap-3">
                    {infoGeneral.carreras.map((c) => (
                      <div
                        key={c.id_carrera}
                        className="flex items-center justify-between
                          border-b border-gray-100 pb-2"
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {c.nombre_carrera}
                          </p>
                          {c.sigla_carrera && (
                            <p className="text-xs text-gray-400">
                              {c.sigla_carrera}
                            </p>
                          )}
                        </div>
                        <span
                          className="bg-blue-100 text-blue-800 px-2 py-1
                          rounded-full text-xs font-semibold"
                        >
                          {c.total_estudiantes} est.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Áreas */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Áreas / Departamentos
                  </h2>
                  <div className="flex flex-col gap-3">
                    {infoGeneral.areas.map((a) => (
                      <div
                        key={a.id_area}
                        className="border border-gray-100 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {a.nombre_area}
                          </p>
                          <span
                            className="bg-purple-100 text-purple-800 px-2 py-0.5
                            rounded-full text-xs font-semibold"
                          >
                            {a.total_asignaciones} asig.
                          </span>
                        </div>
                        {a.ubicacion_campus && (
                          <p className="text-xs text-gray-400">
                            📍 {a.ubicacion_campus}
                          </p>
                        )}
                        {a.responsable_nombre && (
                          <p className="text-xs text-gray-500 mt-1">
                            👤 {a.responsable_nombre}
                            {a.responsable_telefono &&
                              ` — ${a.responsable_telefono}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
