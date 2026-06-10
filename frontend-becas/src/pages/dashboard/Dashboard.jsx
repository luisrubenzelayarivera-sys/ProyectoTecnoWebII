import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import {
  getEstadosBecas,
  getTiposReporte,
  getEvaluaciones,
  getInfoGeneral,
} from "../../api/reportes.api";
import KPICard from "../../components/KPICard";
import SelectCustom from "../../components/SelectCustom";

const badgeEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":     return "bg-emerald-100 text-emerald-800";
    case "SUSPENDIDA": return "bg-amber-100 text-amber-800";
    case "FINALIZADA": return "bg-slate-100 text-slate-600";
    case "ABANDONADA": return "bg-red-100 text-red-700";
    default:           return "bg-blue-100 text-blue-800";
  }
};

const Dashboard = () => {
  const [estadosBecas, setEstadosBecas] = useState([]);
  const [tiposBecas, setTiposBecas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [infoGeneral, setInfoGeneral] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [pageEval, setPageEval] = useState(1);
  const [totalPagesEval, setTotalPagesEval] = useState(1);
  const [tab, setTab] = useState("resumen");

  useEffect(() => {
    if (cargando) return;
    const recargar = async () => {
      try {
        const [estados, tipos] = await Promise.all([
          getEstadosBecas(filtroTipo, filtroPeriodo),
          getTiposReporte(filtroPeriodo),
        ]);
        setEstadosBecas(estados.data);
        setTiposBecas(tipos.data);
      } catch (err) {
        console.error(err);
      }
    };
    recargar();
  }, [filtroTipo, filtroPeriodo, cargando]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [estados, tipos, evals, info] = await Promise.all([
          getEstadosBecas(),
          getTiposReporte(filtroPeriodo),
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
  }, [filtroPeriodo]);

  const cargarEvaluaciones = async (p) => {
    const res = await getEvaluaciones(p, 5);
    setEvaluaciones(res.data.data);
    setTotalPagesEval(res.data.totalPages);
    setPageEval(p);
  };

  const tiposFiltrados = tiposBecas.filter(
    (t) => !filtroTipo || t.nombre_beca === filtroTipo
  );

  const TABS = [
    { key: "resumen",     label: "Resumen" },
    { key: "evaluaciones",label: "Evaluaciones" },
    { key: "info",        label: "Carreras y Áreas" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Panel de control</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px
                ${tab === t.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-14">
            <p className="text-slate-400 text-sm">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* TAB RESUMEN */}
            {tab === "resumen" && (
              <div className="flex flex-col gap-6">
                <div className="flex gap-3 items-center flex-wrap">
                  <SelectCustom value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    {tiposBecas.map((t) => (
                      <option key={t.nombre_beca} value={t.nombre_beca}>{t.nombre_beca}</option>
                    ))}
                  </SelectCustom>
                  <SelectCustom value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                    <option value="">Todos los periodos</option>
                    <option value="1">Periodo I</option>
                    <option value="2">Periodo II</option>
                  </SelectCustom>
                  {(filtroTipo || filtroPeriodo) && (
                    <button
                      onClick={() => { setFiltroTipo(""); setFiltroPeriodo(""); }}
                      className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {estadosBecas.map((item) => (
                    <KPICard key={item.estado_beca} estado={item.estado_beca} total={item.total} />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                      Becas por estado
                    </h2>
                    <div className="flex flex-col gap-3">
                      {estadosBecas.map((item) => (
                        <div key={item.estado_beca} className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeEstado(item.estado_beca)}`}>
                            {item.estado_beca}
                          </span>
                          <span className="text-slate-800 font-bold text-lg">{item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                      Becas por tipo
                    </h2>
                    <div className="flex flex-col gap-3">
                      {tiposFiltrados.map((item) => (
                        <div key={item.nombre_beca}
                          className={`flex items-center justify-between border-b border-slate-100 pb-2.5 transition ${parseInt(item.total) === 0 ? "opacity-40" : ""}`}>
                          <span className="text-sm text-slate-700 font-medium">{item.nombre_beca}</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold ${parseInt(item.total) > 0 ? "text-blue-600" : "text-slate-400"}`}>
                              Prom: {item.promedio_porcentaje ?? "—"}%
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                              ${parseInt(item.total) > 0 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                              {item.total}
                            </span>
                          </div>
                        </div>
                      ))}
                      {tiposFiltrados.length === 0 && (
                        <p className="text-slate-400 text-sm">Sin datos para este filtro</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB EVALUACIONES */}
            {tab === "evaluaciones" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                  {evaluaciones.length === 0 ? (
                    <div className="flex items-center justify-center py-14">
                      <p className="text-slate-400 text-sm">No hay evaluaciones registradas</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 text-white">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Estudiante</th>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Área</th>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Tipo beca</th>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Puntaje</th>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Continuidad</th>
                          <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Comentario</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {evaluaciones.map((ev) => (
                          <tr key={ev.id_evaluacion} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-3 font-medium text-slate-800">{ev.nombre_completo}</td>
                            <td className="px-5 py-3 text-slate-600">{ev.nombre_area}</td>
                            <td className="px-5 py-3 text-slate-600">{ev.nombre_beca}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${ev.puntaje_desempeno >= 75 ? "bg-emerald-500" : ev.puntaje_desempeno >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${ev.puntaje_desempeno}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-slate-800 text-xs">{ev.puntaje_desempeno}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ev.recomienda_continuidad ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                                {ev.recomienda_continuidad ? "Sí" : "No"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-500 text-xs max-w-xs truncate">
                              {ev.comentario_jefe_area ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <Pagination page={pageEval} totalPages={totalPagesEval} onPageChange={cargarEvaluaciones} />
              </div>
            )}

            {/* TAB INFO GENERAL */}
            {tab === "info" && infoGeneral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Carreras</h2>
                  <div className="flex flex-col gap-3">
                    {infoGeneral.carreras.map((c) => (
                      <div key={c.id_carrera} className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{c.nombre_carrera}</p>
                          {c.sigla_carrera && <p className="text-xs text-slate-400">{c.sigla_carrera}</p>}
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {c.total_estudiantes} est.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Áreas / Departamentos</h2>
                  <div className="flex flex-col gap-3">
                    {infoGeneral.areas.map((a) => (
                      <div key={a.id_area} className="border border-slate-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-800 text-sm">{a.nombre_area}</p>
                          <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {a.total_asignaciones} asig.
                          </span>
                        </div>
                        {a.ubicacion_campus && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {a.ubicacion_campus}
                          </p>
                        )}
                        {a.responsable_nombre && (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {a.responsable_nombre}{a.responsable_telefono && ` — ${a.responsable_telefono}`}
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
