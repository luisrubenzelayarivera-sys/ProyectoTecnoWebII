import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createUsuario } from "../../api/usuarios.api";

const ROLES = ["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA", "BECARIO"];

const NuevoUsuario = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    rol: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await createUsuario(form);
      navigate("/usuarios");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al crear usuario";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/usuarios"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Usuario</h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="usuario@ucb.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="mínimo 8 caracteres"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((rol) => (
                  <label
                    key={rol}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl
                      border-2 cursor-pointer transition text-sm font-medium
                      ${
                        form.rol === rol
                          ? "bg-blue-50 border-blue-500 text-blue-800"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={rol}
                      checked={form.rol === rol}
                      onChange={handleChange}
                      className="accent-blue-800"
                    />
                    {rol}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                  px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Crear usuario"}
              </button>
              <Link
                to="/usuarios"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700
                  font-medium px-6 py-2.5 rounded-lg transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevoUsuario;
