import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getEstudiante, updateEstudiante } from "../../api/estudiantes.api";

const DetalleEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [form, setForm] = useState({
    nombre_completo: "",
    carnet: "",
    email_ucb: "",
    telefono: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getEstudiante(id);
        const e = res.data;
        setForm({
          nombre_completo: e.nombre_completo || "",
          carnet: e.carnet || "",
          email_ucb: e.email_ucb || "",
          telefono: e.telefono || "",
        });
      } catch (err) {
        setError("Estudiante no encontrado");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);

    try {
      await updateEstudiante(id, {
        nombre_completo: form.nombre_completo,
        carnet: form.carnet || null,
        email_ucb: form.email_ucb || null,
        telefono: form.telefono || null,
      });
      setExito("Estudiante actualizado correctamente");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al actualizar estudiante";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-20">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/estudiantes"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Detalle del Estudiante
          </h1>
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

        {/* Éxito */}
        {exito && (
          <div
            className="bg-green-50 border border-green-300 text-green-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {exito}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={form.nombre_completo}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carnet
                </label>
                <input
                  type="text"
                  name="carnet"
                  value={form.carnet}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email UCB
              </label>
              <input
                type="email"
                name="email_ucb"
                value={form.email_ucb}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={guardando}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                  px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <Link
                to="/estudiantes"
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

export default DetalleEstudiante;
