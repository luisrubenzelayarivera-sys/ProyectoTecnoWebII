import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createAsignacion, getAreas } from "../../api/asignacion.api";
import { getListaBecas } from "../../api/becas.api";

const NuevaAsignacion = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [becas, setBecas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [areas, setAreas] = useState([]);

  const [form, setForm] = useState({
    id_beca: "",
    id_area: "",
    horas_semana: "",
    tiene_pre_registro: false,
    visitadora: "",
    nivel_necesidad: "",
    codigo_informe: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        // Cargamos las becas
        const res = await getListaBecas();
        setBecas(res.data);

        // Cargamos las áreas
        const resAreas = await getAreas();
        setAreas(resAreas.data);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      }
    };

    cargar();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const becasFiltradas = becas.filter(
    (b) =>
      b.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.nombre_beca.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const becaSeleccionada = becas.find((b) => b.id_beca === form.id_beca);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datos = {
        id_beca: form.id_beca,
        id_area: parseInt(form.id_area),
        horas_semana: parseInt(form.horas_semana),
        id_pre_registro: null,
      };

      await createAsignacion(datos);
      navigate("/asignacion");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al crear asignación";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/asignacion"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Asignación</h1>
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
            {/* Buscador de beca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar beca *
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre del estudiante o tipo de beca..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {busqueda && !form.id_beca && (
                <div
                  className="border border-gray-200 rounded-lg mt-1
    max-h-48 overflow-y-auto shadow-sm"
                >
                  {becasFiltradas.length === 0 ? (
                    <p className="text-gray-400 text-sm px-4 py-3">
                      No se encontraron becas
                    </p>
                  ) : (
                    becasFiltradas.map((b) => (
                      <button
                        key={b.id_beca}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, id_beca: b.id_beca });
                          setBusqueda(b.nombre_completo);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50
            text-sm border-b border-gray-100 last:border-0 transition"
                      >
                        <span className="font-medium text-gray-800">
                          {b.nombre_completo}
                        </span>
                        <span className="text-gray-400 ml-2 text-xs">
                          {b.nombre_beca} — {b.porcentaje}% — {b.gestion}/
                          {b.periodo === 1 ? "I" : "II"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {becaSeleccionada && (
                <div
                  className="mt-2 bg-blue-50 border border-blue-200
                  rounded-lg px-4 py-2 text-sm text-blue-800 flex justify-between"
                >
                  <div>
                    <span className="font-medium">
                      ✓ {becaSeleccionada.nombre_completo}
                    </span>
                    <span className="text-blue-600 ml-2">
                      {becaSeleccionada.nombre_beca}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, id_beca: "" });
                      setBusqueda("");
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área *
                </label>
                <select
                  name="id_area"
                  value={form.id_area}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar área...</option>
                  {areas.map((a) => (
                    <option key={a.id_area} value={a.id_area}>
                      {a.nombre_area}{" "}
                      {a.ubicacion_campus ? `— ${a.ubicacion_campus}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas por semana *
                </label>
                <input
                  type="number"
                  name="horas_semana"
                  value={form.horas_semana}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="20"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={cargando || !form.id_beca}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                  px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Guardar asignación"}
              </button>
              <Link
                to="/asignacion"
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

export default NuevaAsignacion;
