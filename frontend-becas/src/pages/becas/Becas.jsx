import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getBecas, deleteBeca, getTiposBeca } from "../../api/becas.api";
import DropdownMenu from "../../components/DropdownMenu";

const badgeEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":      return "bg-green-100 text-green-800";
    case "SUSPENDIDA":  return "bg-amber-100 text-amber-800";
    case "FINALIZADA":  return "bg-slate-100 text-slate-600";
    case "ABANDONADA":  return "bg-red-100 text-red-700";
    default:            return "bg-blue-100 text-blue-800";
  }
};

const Becas = () => {
  const [becas, setBecas] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [tiposBeca, setTiposBeca] = useState([]);
  const navigate = useNavigate();

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getBecas(p, 10);
      setBecas(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      setError("Error al cargar el listado de becas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      await cargar();
      try {
        const res = await getTiposBeca();
        setTiposBeca(res.data);
      } catch (err) {
        console.error("Error al cargar tipos de beca.");
      }
    };
    inicializar();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Confirma la eliminación de esta beca? Esta acción no se puede deshacer.")) return;
    try {
      await deleteBeca(id);
      cargar(page);
    } catch (err) {
      setError("No se pudo eliminar la beca.");
    }
  };

  const becasFiltradas = becas
    .filter((b) => !filtroEstado || b.estado_beca === filtroEstado)
    .filter((b) => !filtroTipo || b.nombre_beca === filtroTipo);

  const hayFiltros = filtroEstado || filtroTipo;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Gestión de Becas</h1>
            <p className="text-slate-500 text-sm mt-0.5">{total} registro{total !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/becas/nueva"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nueva beca</span>
            <span className="sm:hidden">Nueva</span>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 sm:gap-3 mb-5 flex-wrap">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0">
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activa</option>
            <option value="SUSPENDIDA">Suspendida</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="ABANDONADA">Abandonada</option>
          </select>

          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0">
            <option value="">Todos los tipos</option>
            {tiposBeca.map((t) => (
              <option key={t.id_tipo_beca} value={t.nombre_beca}>{t.nombre_beca}</option>
            ))}
          </select>

          {hayFiltros && (
            <button onClick={() => { setFiltroEstado(""); setFiltroTipo(""); }}
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-14">
            <p className="text-slate-400 text-sm">Cargando...</p>
          </div>
        ) : becasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-14 gap-2">
            <p className="text-slate-400 text-sm">No hay becas registradas</p>
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Estudiante</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Tipo de beca</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Porcentaje</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Gestión</th>
                    <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Estado</th>
                    <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {becasFiltradas.map((b) => (
                    <tr key={b.id_beca} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-medium text-slate-800">{b.nombre_completo}</td>
                      <td className="px-5 py-3 text-slate-600">{b.nombre_beca}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">{b.porcentaje}%</td>
                      <td className="px-5 py-3 text-slate-500">{b.gestion} / {b.periodo === 1 ? "I" : "II"}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeEstado(b.estado_beca)}`}>
                          {b.estado_beca}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <DropdownMenu opciones={[
                          { label: "Ver detalle",       icon: "ver",    accion: () => navigate(`/becas/${b.id_beca}`) },
                          { label: "Datos adicionales", icon: "plus",   accion: () => navigate(`/becas/${b.id_beca}/subtipo`) },
                          { label: "Cambiar estado",    icon: "estado", accion: () => navigate(`/becas/${b.id_beca}/estado`) },
                          { label: "Eliminar",          icon: "borrar", danger: true, accion: () => handleEliminar(b.id_beca) },
                        ]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="sm:hidden space-y-3">
              {becasFiltradas.map((b) => (
                <div key={b.id_beca} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{b.nombre_completo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.nombre_beca}</p>
                    </div>
                    <DropdownMenu opciones={[
                      { label: "Ver detalle",       icon: "ver",    accion: () => navigate(`/becas/${b.id_beca}`) },
                      { label: "Datos adicionales", icon: "plus",   accion: () => navigate(`/becas/${b.id_beca}/subtipo`) },
                      { label: "Cambiar estado",    icon: "estado", accion: () => navigate(`/becas/${b.id_beca}/estado`) },
                      { label: "Eliminar",          icon: "borrar", danger: true, accion: () => handleEliminar(b.id_beca) },
                    ]} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeEstado(b.estado_beca)}`}>
                      {b.estado_beca}
                    </span>
                    <span className="text-xs text-slate-500">{b.porcentaje}%</span>
                    <span className="text-xs text-slate-400">{b.gestion} / {b.periodo === 1 ? "I" : "II"}</span>
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

export default Becas;
