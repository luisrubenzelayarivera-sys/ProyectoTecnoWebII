import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getAsignacion, evaluarAsignacion } from "../../api/asignacion.api";

const Evaluacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asignacion, setAsignacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    puntaje_desempeno: "",
    comentario_jefe_area: "",
    recomienda_continuidad: false,
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getAsignacion(id);
        setAsignacion(res.data);
      } catch (err) {
        setError("Asignación no encontrada");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      await evaluarAsignacion(id, {
        puntaje_desempeno: parseInt(form.puntaje_desempeno),
        comentario_jefe_area: form.comentario_jefe_area || null,
        recomienda_continuidad: form.recomienda_continuidad,
      });
      navigate("/asignacion");
    } catch (err) {
      const msg =
        err.response?.data?.errores?.[0]?.msg ||
        err.response?.data?.error ||
        "Error al guardar evaluación";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center text-gray-500 mt-20">Cargando...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/asignacion"
            className="text-blue-800 hover:underline text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Evaluación</h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        {asignacion && (
          <div className="flex flex-col gap-4">
            {/* Info asignación */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Asignación
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Estudiante</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_completo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_area}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Horas por semana</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.horas_semana}h
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo de beca</p>
                  <p className="font-medium text-gray-800">
                    {asignacion.nombre_beca}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario evaluación */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Datos de evaluación
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntaje de desempeño (1-100) *
                  </label>
                  <input
                    type="number"
                    name="puntaje_desempeno"
                    value={form.puntaje_desempeno}
                    onChange={handleChange}
                    required
                    min="1"
                    max="100"
                    placeholder="85"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Barra visual del puntaje */}
                  {form.puntaje_desempeno && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all
                            ${
                              form.puntaje_desempeno >= 75
                                ? "bg-green-500"
                                : form.puntaje_desempeno >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          style={{ width: `${form.puntaje_desempeno}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {form.puntaje_desempeno}/100
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentario del jefe de área
                  </label>
                  <textarea
                    name="comentario_jefe_area"
                    value={form.comentario_jefe_area}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Descripción del desempeño del estudiante..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl
                  border-2 cursor-pointer transition
                  ${
                    form.recomienda_continuidad
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  onClick={() =>
                    setForm({
                      ...form,
                      recomienda_continuidad: !form.recomienda_continuidad,
                    })
                  }
                >
                  <input
                    type="checkbox"
                    name="recomienda_continuidad"
                    checked={form.recomienda_continuidad}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Recomienda continuidad
                    </p>
                    <p className="text-xs text-gray-500">
                      El estudiante puede continuar con la beca el siguiente
                      semestre
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                      px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Guardar evaluación"}
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
        )}
      </div>
    </div>
  );
};

export default Evaluacion;
