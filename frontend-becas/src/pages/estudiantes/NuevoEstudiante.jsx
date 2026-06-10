import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createEstudiante, getCarreras } from "../../api/estudiantes.api";
import SelectCustom from "../../components/SelectCustom";

const NuevoEstudiante = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [carreras, setCarreras] = useState([]);

  const [form, setForm] = useState({
    nombre_completo: "",
    carnet: "",
    email_ucb: "",
    telefono: "",
    id_carrera: "",
    gestion_inicio: "",
    periodo_inicio: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getCarreras();
        setCarreras(res.data);
      } catch (err) {
        console.error("Error al cargar carreras");
      }
    };
    cargar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datos = {
        nombre_completo: form.nombre_completo,
        carnet: form.carnet || null,
        email_ucb: form.email_ucb || null,
        telefono: form.telefono || null,
        id_carrera: form.id_carrera ? parseInt(form.id_carrera) : null,
        gestion_inicio: form.gestion_inicio
          ? parseInt(form.gestion_inicio)
          : null,
        periodo_inicio: form.periodo_inicio
          ? parseInt(form.periodo_inicio)
          : null,
      };

      await createEstudiante(datos);
      navigate("/estudiantes");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al crear estudiante";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/estudiantes"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Estudiante</h1>
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
                placeholder="Juan Pérez Mamani"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carnet
                </label>
                <input
                  type="text"
                  name="carnet"
                  value={form.carnet}
                  onChange={handleChange}
                  placeholder="12345678"
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
                  placeholder="70000000"
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
                placeholder="juan.perez@ucb.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrera
                </label>
                <SelectCustom
                  name="id_carrera"
                  value={form.id_carrera}
                  onChange={handleChange}
                >
                  <option value="">Elija carrera...</option>
                  {carreras.map((c) => (
                    <option key={c.id_carrera} value={c.id_carrera}>
                      {c.nombre_carrera}{" "}
                      {c.sigla_carrera ? `(${c.sigla_carrera})` : ""}
                    </option>
                  ))}
                </SelectCustom>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestión inicio
                </label>
                <input
                  type="number"
                  name="gestion_inicio"
                  value={form.gestion_inicio}
                  onChange={handleChange}
                  placeholder="2024"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodo inicio
                </label>
                <SelectCustom
                  name="periodo_inicio"
                  value={form.periodo_inicio}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </SelectCustom>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                  px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Guardar estudiante"}
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

export default NuevoEstudiante;
