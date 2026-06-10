import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getUsuarios, deleteUsuario, updateUsuario, cambiarPassword } from "../../api/usuarios.api";

const ROLES = ["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA", "BECARIO"];

const ROLES_DESC = {
  ADMIN:          { label: "Administrador",      desc: "Acceso total: gestión de usuarios, becas, estudiantes, asignaciones y reportes.", badge: "bg-violet-100 text-violet-800" },
  TRABAJO_SOCIAL: { label: "Trabajo Social",     desc: "Puede crear y gestionar becas, estudiantes y asignaciones. No puede administrar usuarios.", badge: "bg-blue-100 text-blue-800" },
  JEFE_AREA:      { label: "Jefe de Área",       desc: "Puede registrar evaluaciones de desempeño de los becarios asignados a su área.", badge: "bg-amber-100 text-amber-800" },
  BECARIO:        { label: "Becario",            desc: "Acceso de solo lectura a su propia información de beca y asignación.", badge: "bg-emerald-100 text-emerald-800" },
};

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";

// ── Modal reutilizable ──────────────────────────────────────────────
const Modal = ({ titulo, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">{titulo}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Modal Editar Usuario ────────────────────────────────────────────
const ModalEditar = ({ usuario, onClose, onGuardado }) => {
  const [form, setForm] = useState({ email: usuario.email, rol: usuario.rol });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await updateUsuario(usuario.id_usuario, form);
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo="Editar usuario" onClose={onClose}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <label key={r}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition text-xs font-medium
                  ${form.rol === r ? "bg-blue-50 border-blue-500 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                <input type="radio" name="rol" value={r} checked={form.rol === r}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="accent-blue-600" />
                {ROLES_DESC[r].label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
            {cargando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Modal Cambiar Contraseña ────────────────────────────────────────
const ModalPassword = ({ usuario, onClose, onGuardado }) => {
  const [form, setForm] = useState({ password_actual: "", password_nuevo: "", confirmar: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password_nuevo !== form.confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (form.password_nuevo.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    try {
      await cambiarPassword(usuario.id_usuario, {
        password_actual: form.password_actual,
        password_nuevo: form.password_nuevo,
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo="Cambiar contraseña" onClose={onClose}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}
      <p className="text-sm text-slate-500 mb-4">{usuario.email}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña actual</label>
          <input type="password" value={form.password_actual}
            onChange={(e) => setForm({ ...form, password_actual: e.target.value })}
            required placeholder="••••••••" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva contraseña</label>
          <input type="password" value={form.password_nuevo}
            onChange={(e) => setForm({ ...form, password_nuevo: e.target.value })}
            required placeholder="••••••••" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nueva contraseña</label>
          <input type="password" value={form.confirmar}
            onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
            required placeholder="••••••••" className={inputCls} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
            {cargando ? "Cambiando..." : "Cambiar contraseña"}
          </button>
          <button type="button" onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Página principal ────────────────────────────────────────────────
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalEditar, setModalEditar] = useState(null);    // usuario seleccionado
  const [modalPassword, setModalPassword] = useState(null);// usuario seleccionado
  const [verRoles, setVerRoles] = useState(false);

  const cargar = async (p = 1) => {
    setCargando(true);
    try {
      const res = await getUsuarios(p, 10);
      setUsuarios(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch {
      setError("Error al cargar el listado de usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Confirma la eliminación de este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await deleteUsuario(id);
      setExito("Usuario eliminado correctamente.");
      setTimeout(() => setExito(""), 3000);
      cargar(page);
    } catch {
      setError("No se pudo eliminar el usuario.");
    }
  };

  const handleGuardado = (msg) => {
    setModalEditar(null);
    setModalPassword(null);
    setExito(msg || "Cambios guardados correctamente.");
    setTimeout(() => setExito(""), 3000);
    cargar(page);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Modales */}
      {modalEditar && (
        <ModalEditar
          usuario={modalEditar}
          onClose={() => setModalEditar(null)}
          onGuardado={() => handleGuardado("Usuario actualizado correctamente.")}
        />
      )}
      {modalPassword && (
        <ModalPassword
          usuario={modalPassword}
          onClose={() => setModalPassword(null)}
          onGuardado={() => handleGuardado("Contraseña cambiada correctamente.")}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Usuarios del sistema</h1>
            <p className="text-slate-500 text-sm mt-0.5">{total} registro{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setVerRoles(!verRoles)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Roles y permisos
            </button>
            <Link
              to="/usuarios/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo usuario
            </Link>
          </div>
        </div>

        {/* Panel de roles */}
        {verRoles && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Descripción de roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ROLES_DESC).map(([rol, info]) => (
                <div key={rol} className="border border-slate-100 rounded-lg p-3.5">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${info.badge}`}>
                    {info.label}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">{info.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
        )}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {exito}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center py-14">
              <p className="text-slate-400 text-sm">Cargando...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-slate-400 text-sm">No hay usuarios registrados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Correo</th>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Rol</th>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">Creación</th>
                  <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-medium text-slate-800">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLES_DESC[u.rol]?.badge || "bg-slate-100 text-slate-600"}`}>
                        {ROLES_DESC[u.rol]?.label || u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.estado ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(u.fecha_creacion).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setModalEditar(u)}
                          title="Editar usuario"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setModalPassword(u)}
                          title="Cambiar contraseña"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEliminar(u.id_usuario)}
                          title="Eliminar usuario"
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => cargar(p)} />
      </div>
    </div>
  );
};

export default Usuarios;
