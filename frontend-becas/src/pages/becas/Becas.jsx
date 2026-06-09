import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getBecas, deleteBeca, getTiposBeca } from "../../api/becas.api";
import DropdownMenu from "../../components/DropdownMenu";

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
      setError("Error al cargar becas");
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
        console.error("Error al cargar tipos de beca");
      }
    };
    inicializar();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta beca?")) return;
    try {
      await deleteBeca(id);
      cargar(page);
    } catch (err) {
      setError("Error al eliminar beca");
    }
  };

  const becasFiltradas = becas
    .filter((b) => !filtroEstado || b.estado_beca === filtroEstado)
    .filter((b) => !filtroTipo || b.nombre_beca === filtroTipo);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Becas</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} registros encontrados
            </p>
          </div>
          <Link
            to="/becas/nueva"
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2
              rounded-lg text-sm font-medium transition"
          >
            + Nueva beca
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activa</option>
            <option value="SUSPENDIDA">Suspendida</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="ABANDONADA">Abandonada</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {tiposBeca.map((t) => (
              <option key={t.id_tipo_beca} value={t.nombre_beca}>
                {t.nombre_beca}
              </option>
            ))}
          </select>

          {(filtroEstado || filtroTipo) && (
            <button
              onClick={() => {
                setFiltroEstado("");
                setFiltroTipo("");
              }}
              className="text-sm text-red-500 hover:text-red-700 px-3"
            >
              ✕ Limpiar filtros
            </button>
          )}
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
          ) : becasFiltradas.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No hay becas registradas
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Estudiante</th>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Porcentaje</th>
                  <th className="px-6 py-3 text-left">Gestión</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {becasFiltradas.map((b, i) => (
                  <tr
                    key={b.id_beca}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {b.nombre_completo}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{b.nombre_beca}</td>
                    <td className="px-6 py-3 text-gray-600">{b.porcentaje}%</td>
                    <td className="px-6 py-3 text-gray-600">
                      {b.gestion} - {b.periodo === 1 ? "I" : "II"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${colorEstado(b.estado_beca)}`}
                      >
                        {b.estado_beca}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <DropdownMenu
                        opciones={[
                          {
                            label: "Ver detalle",
                            icon: "👁",
                            accion: () => navigate(`/becas/${b.id_beca}`),
                          },
                          {
                            label: "Agregar subtipo",
                            icon: "➕",
                            accion: () =>
                              navigate(`/becas/${b.id_beca}/subtipo`),
                          },
                          {
                            label: "Cambiar estado",
                            icon: "🔄",
                            accion: () =>
                              navigate(`/becas/${b.id_beca}/estado`),
                          },
                          {
                            label: "Eliminar",
                            icon: "🗑",
                            danger: true,
                            accion: () => handleEliminar(b.id_beca),
                          },
                        ]}
                      />
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

export default Becas;
