import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getUsuarios, deleteUsuario } from "../../api/usuarios.api";

const colorRol = (rol) => {
  switch (rol) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800";
    case "TRABAJO_SOCIAL":
      return "bg-blue-100 text-blue-800";
    case "JEFE_AREA":
      return "bg-yellow-100 text-yellow-800";
    case "BECARIO":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getUsuarios(p, 10);
      setUsuarios(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      setError("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await deleteUsuario(id);
      cargar(page);
    } catch (err) {
      setError("Error al eliminar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} registros encontrados
            </p>
          </div>
          <Link
            to="/usuarios/nuevo"
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2
              rounded-lg text-sm font-medium transition"
          >
            + Nuevo usuario
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
          ) : usuarios.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No hay usuarios registrados
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Fecha creación</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => (
                  <tr
                    key={u.id_usuario}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {u.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${colorRol(u.rol)}`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          u.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(u.fecha_creacion).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleEliminar(u.id_usuario)}
                        className="bg-red-100 hover:bg-red-200 text-red-700
                          px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        Eliminar
                      </button>
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

export default Usuarios;
