import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBeca, updateEstadoBeca } from "../../api/becas.api";

const ESTADOS = ["ACTIVA", "SUSPENDIDA", "FINALIZADA", "ABANDONADA"];

const colorEstado = (estado) => {
  switch (estado) {
    case "ACTIVA":
      return "bg-green-100 text-green-800 border-green-300";
    case "SUSPENDIDA":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "FINALIZADA":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "ABANDONADA":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
};

const EstadoBeca = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beca, setBeca] = useState(null);
  const [estadoSel, setEstadoSel] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getBeca(id);
        setBeca(res.data);
        setEstadoSel(res.data.estado_beca);
      } catch (err) {
        setError("Beca no encontrada");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await updateEstadoBeca(id, estadoSel);
      navigate("/becas");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
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
          <Link to="/becas" className="text-blue-800 hover:underline text-sm">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Cambiar Estado</h1>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700
            rounded-lg px-4 py-3 text-sm mb-6"
          >
            {error}
          </div>
        )}

        {beca && (
          <div className="bg-white rounded-2xl shadow p-8">
            {/* Info beca */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-sm text-gray-500">Estudiante</p>
              <p className="font-semibold text-gray-800">
                {beca.nombre_completo}
              </p>
              <p className="text-sm text-gray-500 mt-2">Tipo de beca</p>
              <p className="font-medium text-gray-700">{beca.nombre_beca}</p>
            </div>

            {/* Selector de estado */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm font-medium text-gray-700">
                Selecciona el nuevo estado:
              </p>

              <div className="flex flex-col gap-3">
                {ESTADOS.map((estado) => (
                  <label
                    key={estado}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl
                      border-2 cursor-pointer transition
                      ${
                        estadoSel === estado
                          ? colorEstado(estado)
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={estado}
                      checked={estadoSel === estado}
                      onChange={() => setEstadoSel(estado)}
                      className="accent-blue-800"
                    />
                    <span className="text-sm font-medium">{estado}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold
                    px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar cambio"}
                </button>
                <Link
                  to="/becas"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700
                    font-medium px-6 py-2.5 rounded-lg transition"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadoBeca;
